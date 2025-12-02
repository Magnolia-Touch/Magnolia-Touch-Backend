import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { generateCode, generateUsername } from 'src/utils/code-generator.util'; // adjust path if needed
import { HttpStatus } from '@nestjs/common';
import { CreateProfileDto, CheckoutDto } from './dto/create-profile.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from 'src/stripe/stripe.service';
import { generateOrderIdforProduct } from 'src/utils/code-generator.util';
import { OrdersService } from 'src/orders/orders.service';

import { Logger } from '@nestjs/common';
import { EventsDto, FamilyDto } from './dto/childrens.dto';
import { QrService } from 'src/qr_generator/qr.service';

@Injectable()
export class MemorialProfileService {
  private readonly logger = new Logger(MemorialProfileService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private emailService: MailerService,
    private stripeService: StripeService,
    private readonly orderservice: OrdersService,
  ) { }
  private ensureHttpsUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  private getDefaultUrl(path: string): string {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }
    const baseUrl = this.ensureHttpsUrl(frontendUrl);
    return `${baseUrl}${path}`;
  }

  async getProfile(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        biography: true,
        family: true,
        gallery: true,
        guestBook: true,
        Events: true,
        SocialLinks: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async getProfileList(
    email: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      owner_id: email,
    };

    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search.toLowerCase() } },
        { lastName: { contains: search.toLowerCase() } },
      ];
    }

    const [profiles, totalCount] = await this.prisma.$transaction([
      this.prisma.deadPersonProfile.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
          biography: true,
          family: true,
          gallery: true,
          guestBook: true,
          Events: true,
          SocialLinks: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.deadPersonProfile.count({ where: whereCondition }),
    ]);

    if (!profiles || profiles.length === 0) {
      return {
        message: 'No Profiles Found',
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      message: 'Profiles fetched successfully',
      data: profiles,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      status: HttpStatus.OK,
    };
  }

  async addGuestbook(
    slug: string,
    dto: CreateGuestBookDto,
    image: Express.Multer.File,
  ) {
    const { first_name, last_name, guestemail, phone, message } = dto;
    let imageUrl: string | null = null;
    if (image) {
      // Upload image to S3
      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!this.s3Service.validateFileType(image, allowedImageTypes)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        );
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!this.s3Service.validateFileSize(image, maxSize)) {
        throw new BadRequestException(
          'File size too large. Maximum size is 5MB.',
        );
      }
      imageUrl = await this.s3Service.uploadFile(
        image,
        `guestbook/${slug}/images`,
      );
    }
    const date = new Date().toISOString(); // Get current date in ISO format
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        guestBook: true,
      },
    });
    if (!profile || !profile.guestBook.length) {
      throw new NotFoundException('Guestbook not found for this profile');
    }
    const guestbook_id = profile.guestBook[0].guestbook_id;
    const created = await this.prisma.guestBookItems.create({
      data: {
        guestbook_id: guestbook_id,
        first_name: first_name,
        last_name: last_name,
        email: guestemail,
        message: message,
        phone: phone,
        photo_upload: imageUrl,
        date: date,
        is_approved: false,
      },
    });

    // ✅ Send email notification to profile owner here
    const profileOwnerEmail = profile.owner_id; // adjust field based on your DB structure
    if (profileOwnerEmail) {
      const visitorName = `${first_name} ${last_name}`.trim();
      await this.sendProfileOwnerNotification(
        profileOwnerEmail,
        visitorName,
        profile.firstName || profile.lastName || 'owner name', // adjust based on your DB field
      );
    }
    return {
      message: `GuestBook entry added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  async getGuestBookApproved(
    slug: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    // find profile first
    const profile = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: { profile: { select: { owner_id: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // build search filter for guestBookItems
    const searchFilter = search
      ? {
        OR: [
          { first_name: { contains: search.toLowerCase() } },
          { last_name: { contains: search.toLowerCase() } },
        ],
      }
      : {};

    const skip = (page - 1) * limit;

    // count total for pagination
    const totalItems = await this.prisma.guestBookItems.count({
      where: {
        guestbook_id: profile.guestbook_id,
        is_approved: true,
        ...searchFilter,
      },
    });

    // fetch paginated guestbook items
    const guestBookItems = await this.prisma.guestBookItems.findMany({
      where: {
        guestbook_id: profile.guestbook_id,
        is_approved: true,
        ...searchFilter,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Profile fetched successfully',
      data: {
        ...profile,
        guestBookItems,
        pagination: {
          total: totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit),
        },
      },
      status: HttpStatus.OK,
    };
  }

  async getGuestBookUnApproved(
    email: string,
    slug: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    // ✅ validate profile ownership
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to view this guestbook',
      );
    }

    // ✅ find guestbook
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: { profile: { select: { owner_id: true } } },
    });
    if (!guestbook) {
      throw new NotFoundException('Guestbook not found for this profile');
    }

    // ✅ search filter
    const searchFilter = search
      ? {
        OR: [
          { first_name: { contains: search.toLowerCase() } },
          { last_name: { contains: search.toLowerCase() } },
        ],
      }
      : {};

    const skip = (page - 1) * limit;

    // ✅ count total unapproved items
    const totalItems = await this.prisma.guestBookItems.count({
      where: {
        guestbook_id: guestbook.guestbook_id,
        is_approved: false,
        ...searchFilter,
      },
    });

    // ✅ fetch paginated unapproved guestbook items
    const guestBookItems = await this.prisma.guestBookItems.findMany({
      where: {
        guestbook_id: guestbook.guestbook_id,
        is_approved: false,
        ...searchFilter,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Profile fetched successfully',
      data: {
        ...guestbook,
        guestBookItems,
        pagination: {
          total: totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit),
        },
      },
      status: HttpStatus.OK,
    };
  }

  async updateGuestBook(email: string, slug: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to view this guestbook',
      );
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true,
      },
    });
    if (!guestbook) {
      throw new NotFoundException('Guestbook not found for this profile');
    }
    await this.prisma.guestBookItems.update({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
      data: {
        is_approved: true,
      },
    });

    return {
      message: 'GuestMessage Approved Succesfully',
      status: HttpStatus.OK,
    };
  }

  async deleteGuestBook(email: string, slug: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: true,
      },
    });

    if (!profile || !profile.gallery.length) {
      throw new NotFoundException('Gallery not found for this profile');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to view this guestbook',
      );
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true,
      },
    });
    if (!guestbook) {
      throw new NotFoundException('Guestbook not found for this profile');
    }

    // Get the guestbook item to delete photo from S3
    const guestbookItem = await this.prisma.guestBookItems.findUnique({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
    });

    if (guestbookItem && guestbookItem.photo_upload) {
      // Delete photo from S3 if it exists
      try {
        await this.s3Service.deleteFile(guestbookItem.photo_upload);
      } catch (error) {
        console.warn(
          'Failed to delete guestbook photo from S3:',
          error.message,
        );
      }
    }

    await this.prisma.guestBookItems.delete({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
    });

    return {
      message: 'GuestBook item deleted successfully',
      status: HttpStatus.OK,
    };
  }

  // This method is deprecated - use uploadMedia instead
  async addGalleryItems(
    email: string,
    slug: string,
    mediatype: string,
    image: Express.Multer.File,
  ) {
    // Redirect to the new S3-integrated method
    if (mediatype === 'photos' || mediatype === 'videos') {
      return this.uploadMedia(email, slug, mediatype, image);
    } else if (mediatype === 'links') {
      throw new BadRequestException(
        'Links cannot be uploaded as files. Please use a different endpoint to add link URLs.',
      );
    } else {
      throw new BadRequestException(`Invalid mediatype: ${mediatype}`);
    }
  }

  async getGallery(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: {
          select: { link: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async deleteGalleryItems(
    email: string,
    slug: string,
    mediatype: string,
    id: number,
  ) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: { gallery: true },
    });
    if (!profile || !profile.gallery.length) {
      throw new NotFoundException('Gallery not found for this profile');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to view this guestbook',
      );
    }
    const gallery_id = profile.gallery[0].gallery_id;
    const validmedia = ['links', 'photos', 'videos'];
    if (!validmedia.includes(mediatype.toLowerCase())) {
      throw new BadRequestException(`Invalid Mediatype: ${mediatype}`);
    }
    const mediaMap: Record<string, string> = {
      photos: 'photos',
      videos: 'videos',
      links: 'links',
    };
    const idFieldsMap: Record<string, string> = {
      photos: 'photo_id',
      videos: 'video_id',
      links: 'link_id',
    };
    const modelName = mediaMap[mediatype.toLowerCase()];
    const idField = idFieldsMap[modelName];
    if (!modelName || !idField) {
      throw new BadRequestException(`Invalid Mediatype: ${mediatype}`);
    }

    // Get the media item to delete from S3
    const mediaItem = await this.prisma[modelName].findUnique({
      where: {
        [idField]: id,
        gallery_id,
      } as any,
    });

    if (mediaItem && mediaItem.url) {
      // Delete from S3 if it's an S3 URL
      try {
        await this.s3Service.deleteFile(mediaItem.url);
      } catch (error) {
        console.warn('Failed to delete from S3:', error.message);
      }
    }

    // Delete from database
    await this.prisma[modelName].delete({
      where: {
        [idField]: id,
        gallery_id,
      } as any, // Cast to any to satisfy TS
    });
    return {
      message: `${mediatype} item with ID ${id} deleted successfully.`,
      status: HttpStatus.OK,
    };
  }

  // New S3-integrated methods
  async uploadProfileImage(
    email: string,
    slug: string,
    type: 'profile' | 'background',
    file: Express.Multer.File,
  ) {
    // Validate file type
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!this.s3Service.validateFileType(file, allowedImageTypes)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB.',
      );
    }

    // Check if user owns the profile
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to update this profile',
      );
    }

    // Upload to S3
    const folder = `profiles/${slug}/${type}-images`;
    const imageUrl = await this.s3Service.uploadFile(file, folder);

    // Delete old image from S3 if it exists
    const oldImageUrl =
      type === 'profile' ? profile.profile_image : profile.background_image;
    if (oldImageUrl) {
      try {
        await this.s3Service.deleteFile(oldImageUrl);
      } catch (error) {
        console.warn('Failed to delete old image from S3:', error.message);
      }
    }

    // Update profile with new image URL
    const updateData =
      type === 'profile'
        ? { profile_image: imageUrl }
        : { background_image: imageUrl };

    const updatedProfile = await this.prisma.deadPersonProfile.update({
      where: { slug },
      data: updateData,
    });

    return {
      message: `${type === 'profile' ? 'Profile' : 'Background'} image uploaded successfully`,
      data: { imageUrl, profile: updatedProfile },
      status: HttpStatus.OK,
    };
  }

  async uploadMedia(
    email: string,
    slug: string,
    mediatype: string,
    file: Express.Multer.File,
  ) {
    // Validate mediatype
    const validMediaTypes = ['photos', 'videos'];
    if (!validMediaTypes.includes(mediatype.toLowerCase())) {
      throw new BadRequestException(
        'Invalid mediatype. Only photos and videos are supported for file uploads.',
      );
    }

    // Validate file type based on mediatype
    let allowedTypes: string[];
    if (mediatype.toLowerCase() === 'photos') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else {
      allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
      ];
    }

    if (!this.s3Service.validateFileType(file, allowedTypes)) {
      throw new BadRequestException(`Invalid file type for ${mediatype}.`);
    }

    // Validate file size (50MB for videos, 10MB for photos)
    const maxSize =
      mediatype.toLowerCase() === 'videos'
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${mediatype.toLowerCase() === 'videos' ? '50MB' : '10MB'}.`,
      );
    }

    // Check authorization
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: { gallery: true },
    });
    if (!profile || !profile.gallery.length) {
      throw new NotFoundException('Gallery not found for this profile');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to upload media to this profile',
      );
    }

    // Upload to S3
    const folder = `profiles/${slug}/gallery/${mediatype}`;
    const mediaUrl = await this.s3Service.uploadFile(file, folder);

    // Save to database
    const gallery_id = profile.gallery[0].gallery_id;
    const modelName = mediatype.charAt(0).toUpperCase() + mediatype.slice(1);

    const created = await this.prisma[modelName].create({
      data: {
        url: mediaUrl,
        gallery_id,
        deadPersonProfiles: slug,
      },
    });

    return {
      message: `${mediatype} uploaded successfully`,
      data: { mediaUrl, item: created },
      status: HttpStatus.CREATED,
    };
  }

  async uploadMultipleMedia(
    email: string,
    slug: string,
    mediatype: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate mediatype
    const validMediaTypes = ['photos', 'videos'];
    if (!validMediaTypes.includes(mediatype.toLowerCase())) {
      throw new BadRequestException(
        'Invalid mediatype. Only photos and videos are supported for file uploads.',
      );
    }

    // Check authorization
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: { gallery: true },
    });
    if (!profile || !profile.gallery.length) {
      throw new NotFoundException('Gallery not found for this profile');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException(
        'You are not authorized to upload media to this profile',
      );
    }

    // Validate all files
    let allowedTypes: string[];
    if (mediatype.toLowerCase() === 'photos') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else {
      allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
      ];
    }

    const maxSize =
      mediatype.toLowerCase() === 'videos'
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;

    for (const file of files) {
      if (!this.s3Service.validateFileType(file, allowedTypes)) {
        throw new BadRequestException(
          `Invalid file type for ${file.originalname}. Expected ${mediatype}.`,
        );
      }
      if (!this.s3Service.validateFileSize(file, maxSize)) {
        throw new BadRequestException(
          `File ${file.originalname} is too large.`,
        );
      }
    }

    // Upload all files to S3
    const folder = `profiles/${slug}/gallery/${mediatype}`;
    const uploadedUrls = await this.s3Service.uploadMultipleFiles(
      files,
      folder,
    );

    // Save all to database
    const gallery_id = profile.gallery[0].gallery_id;
    const modelName = mediatype.charAt(0).toUpperCase() + mediatype.slice(1);

    const createdItems: any[] = [];
    for (const url of uploadedUrls) {
      const created = await this.prisma[modelName].create({
        data: {
          url,
          gallery_id,
          deadPersonProfiles: slug,
        },
      });
      createdItems.push(created);
    }

    return {
      message: `${files.length} ${mediatype} files uploaded successfully`,
      data: { urls: uploadedUrls, items: createdItems },
      status: HttpStatus.CREATED,
    };
  }

  // dead-person-profile.service.ts
  async addGuestbookWithPhoto(
    slug: string,
    dto: Omit<CreateGuestBookDto, 'photo_upload'>,
    file?: Express.Multer.File,
  ) {
    const { first_name, last_name, guestemail, phone, message } = dto;
    const date = new Date().toISOString();

    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        guestBook: true,
        user: true, // 👈 Make sure the profile owner info (email) is fetched
      },
    });

    if (!profile || !profile.guestBook.length) {
      throw new NotFoundException('Guestbook not found for this profile');
    }

    const photoUrl: string | null = null;

    // upload image (same as your code)...

    const guestbook_id = profile.guestBook[0].guestbook_id;
    const created = await this.prisma.guestBookItems.create({
      data: {
        guestbook_id,
        first_name,
        last_name,
        email: guestemail,
        message,
        phone,
        photo_upload: photoUrl,
        date,
        is_approved: false,
      },
    });

    // ✅ Send email notification to profile owner here
    const profileOwnerEmail = profile.user?.email; // adjust field based on your DB structure
    if (profileOwnerEmail) {
      const visitorName = `${first_name} ${last_name}`.trim();
      await this.sendProfileOwnerNotification(
        profileOwnerEmail,
        visitorName,
        profile.firstName || profile.lastName || 'name', // adjust based on your DB field
      );
    }

    return {
      message: 'GuestBook entry added successfully',
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  async getAllMemoryProfile(query: any) {
    // pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // search term
    const search = query.search || '';

    // born_date filter (exact or range)
    const bornDateFrom = query.bornDateFrom;
    const bornDateTo = query.bornDateTo;

    // death_date filter (exact or range)
    const deathDateFrom = query.deathDateFrom;
    const deathDateTo = query.deathDateTo;

    // Build where clause dynamically
    const where: any = {};

    // SEARCH across firstName, lastName, description, slug
    if (search) {
      where.OR = [
        { firstName: { contains: search.toLowerCase() } },
        { lastName: { contains: search.toLowerCase() } },
        { slug: { contains: search.toLowerCase() } },
      ];
    }

    // FILTER by born_date range
    if (bornDateFrom || bornDateTo) {
      where.born_date = {};
      if (bornDateFrom) {
        where.born_date.gte = bornDateFrom; // "YYYY-MM-DD" string
      }
      if (bornDateTo) {
        where.born_date.lte = bornDateTo;
      }
    }

    // FILTER by death_date range
    if (deathDateFrom || deathDateTo) {
      where.death_date = {};
      if (deathDateFrom) {
        where.death_date.gte = deathDateFrom; // "YYYY-MM-DD" string
      }
      if (deathDateTo) {
        where.death_date.lte = deathDateTo;
      }
    }

    // Fetch data with pagination and filters
    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.deadPersonProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deadPersonProfile.count({ where }),
    ]);

    return {
      message: 'Profiles fetched successfully',
      data: profiles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: HttpStatus.OK,
    };
  }

  // dead-person-profile.service.ts
  async getMemoryProfileById(id: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: id },
      include: {
        biography: true,
        SocialLinks: true,
        family: true,
        Events: true,
        gallery: true,
        guestBook: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return {
      message: 'Profile fetched successfully',
      data: profile,
      status: HttpStatus.OK,
    };
  }

  async sendProfileOwnerNotification(
    ownerEmail: string,
    visitorName: string,
    profileName: string,
  ) {
    const subject = `New Memory Shared on ${profileName}`;
    await this.emailService.sendMail({
      to: ownerEmail,
      subject,
      template: 'memoryNotification',
      context: {
        visitorName,
        profileName,
      },
    });
  }

  async bookingCounts(dateQuery: string) {
    // validate input
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(dateQuery)) {
      throw new HttpException(
        `Invalid date format: ${dateQuery}. Use YYYY-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // build start and end of the requested date
    const baseDate = new Date(`${dateQuery}T00:00:00.000Z`);
    const startOfDay = new Date(baseDate);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Total cleaning services booked (unique by bkng_parent_id)
    const cleaningServiceGroup = await this.prisma.booking.groupBy({
      by: ['bkng_parent_id'],
      where: {
        //show only paid bookings.
        is_bought: true,
        bkng_parent_id: { not: null },
      },
    });
    const cleaningServiceCount = cleaningServiceGroup.length;

    // 2. Total paid person profiles created (irrespective of date)
    const deadPersonProfileCount = await this.prisma.orders.count({
      where: {
        is_paid: true,
      },
    });

    // 3. Cleaning services scheduled on that date (unique by bkng_parent_id)
    const todayCleaningServiceCount = await this.prisma.booking.count({
      where: {
        is_bought: true,
        OR: [
          {
            first_cleaning_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            second_cleaning_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        ],
      },
    });

    return {
      cleaningServiceCount,
      deadPersonProfileCount,
      todayCleaningServiceCount,
      total:
        cleaningServiceCount +
        deadPersonProfileCount +
        todayCleaningServiceCount,
    };
  }


  async checkUserExists(username: string): Promise<boolean> {
    const user = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: username },
    });

    const userDraft = await this.prisma.deadPersonProfileDraft.findUnique({
      where: { slug: username },
    });

    return !!user || !!userDraft;
  }


  async saveDraftProfile(
    dto: CreateProfileDto,
    email: string,
    user_id: number,
    existingSlug?: string, // If provided → update draft
  ) {
    // If user gave slug → try to update an existing draft
    let profile: any = null;
    console.log(existingSlug);
    if (existingSlug) {
      profile = await this.prisma.deadPersonProfileDraft.findUnique({
        where: { slug: existingSlug, owner_id: email },
        include: {
          biography: true,
          gallery: true,
          family: true,
          socialLinks: true,
          events: true,
        },
      });

      if (!profile) {
        throw new BadRequestException('Draft profile not found');
      }
      console.log(dto.profile_image);
      // ---------- UPDATE DRAFT ------------------
      const updated = await this.prisma.deadPersonProfileDraft.update({
        where: { slug: existingSlug },
        data: {
          firstName: dto.firstName ?? profile.firstName,
          lastName: dto.lastName ?? profile.lastName,
          born_date: dto.born_date ?? profile.born_date,
          death_date: dto.death_date ?? profile.death_date,
          memorial_place: dto.memorial_place ?? profile.memorial_place,
          profile_image:
            dto.profile_image === undefined
              ? profile.profile_image   // user intentionally removed image
              : dto.profile_image, // keep or replace

          background_image:
            dto.background_image == undefined
              ? profile.background_image
              : dto.background_image,
          is_paid: false, // Always false for draft

          // Overwrite nested arrays
          biography:
            dto.biography && dto.biography.length > 0
              ? {
                upsert: {
                  update: {
                    description: dto.biography[0].discription,
                  },
                  create: {
                    description: dto.biography[0].discription,
                  },
                },
              }
              : undefined,

          gallery: {
            create: (dto.gallery ?? []).map((g) => ({ link: g.link })),
          },
          family: {
            deleteMany: {},
            create: (dto.family ?? []).map((f) => ({
              relationship: f.relationship,
              name: f.name,
            })),
          },
          socialLinks: {
            deleteMany: {},
            create: (dto.socialLinks ?? []).map((s) => ({
              socialMediaName: s.socialMediaName,
              link: s.link,
            })),
          },
          events: {
            deleteMany: {},
            create: (dto.events ?? []).map((e) => ({
              year: e.year,
              event: e.event,
            })),
          },
        },
        include: {
          biography: true,
          gallery: true,
          family: true,
          socialLinks: true,
          events: true,
        },
      });

      return {
        message: 'Draft updated successfully',
        draft: updated,
      };
    }

    // ---------- CREATE NEW DRAFT ---------------
    // Create unique slug
    let slug = '';
    let ok = false;
    let temp;
    while (!ok) {
      if (dto.firstName && dto.death_date) {
        temp = await generateUsername(
          dto.firstName,
          dto.death_date,
          this.checkUserExists.bind(this)   // 👈 FIX HERE
        );
      }
      else {
        temp = generateCode();
      }

      const exists = await this.prisma.deadPersonProfileDraft.findUnique({
        where: { slug: temp, owner_id: email },
      });
      if (!exists) {
        slug = temp;
        ok = true;
      }
    }

    const newDraft = await this.prisma.deadPersonProfileDraft.create({
      data: {
        owner_id: email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        born_date: dto.born_date,
        death_date: dto.death_date,
        memorial_place: dto.memorial_place,
        profile_image: dto.profile_image,
        background_image: dto.background_image,
        is_paid: false,
        slug,

        biography:
          dto.biography &&
            dto.biography.length > 0 &&
            dto.biography[0].discription
            ? {
              create: {
                description: dto.biography[0].discription,
              },
            }
            : undefined,

        gallery: {
          create: (dto.gallery ?? []).map((g) => ({ link: g.link })),
        },
        family: {
          create: (dto.family ?? []).map((f) => ({
            relationship: f.relationship,
            name: f.name,
          })),
        },
        socialLinks: {
          create: (dto.socialLinks ?? []).map((s) => ({
            socialMediaName: s.socialMediaName,
            link: s.link,
          })),
        },
        events: {
          create: (dto.events ?? []).map((e) => ({
            year: e.year,
            event: e.event,
          })),
        },
      },
    });

    return {
      message: 'Draft created successfully',
      draft: { ...newDraft },
    };
  }

  async submitDraft(email: string, user_id: number, dto: CheckoutDto) {
    const {
      slug,
      shippingaddressId,
      billingaddressId,
      church_id,
      currency,
      successUrl,
      cancelUrl,
    } = dto;
    // 1️⃣ Fetch draft
    const draft = await this.prisma.deadPersonProfileDraft.findUnique({
      where: { slug },
      include: {
        biography: true,
        gallery: true,
        family: true,
        socialLinks: true,
        events: true,
      },
    });

    if (!draft) {
      throw new BadRequestException('Draft not found');
    }

    // 2️⃣ Generate new slug for final profile
    let uniqueSlug = '';
    let ok = false;

    while (!ok) {
      const temp = generateCode();
      const exists = await this.prisma.deadPersonProfile.findUnique({
        where: { slug: temp },
      });
      if (!exists) {
        uniqueSlug = temp;
        ok = true;
      }
    }

    // 3️⃣ Create final profile
    const profile = await this.prisma.deadPersonProfile.create({
      data: {
        owner_id: email,
        firstName: draft.firstName,
        lastName: draft.lastName,
        born_date: draft.born_date,
        death_date: draft.death_date,
        memorial_place: draft.memorial_place,
        profile_image: draft.profile_image,
        background_image: draft.background_image,
        slug: dto.slug,
        is_paid: false,

        biography: draft.biography
          ? {
            create: {
              description: draft.biography.description ?? null,
            },
          }
          : undefined,

        gallery: {
          create: draft.gallery.map((g) => ({ link: g.link })),
        },
        family: {
          create: draft.family.map((f) => ({
            name: f.name,
            relationship: f.relationship,
          })),
        },
        SocialLinks: {
          create: draft.socialLinks.map((s) => ({
            socialMediaName: s.socialMediaName,
            link: s.link,
          })),
        },
        Events: {
          create: draft.events.map((e) => ({
            year: e.year,
            event: e.event,
          })),
        },

        guestBook: {
          create: {},
        },
      },
    });
    let subtotal = 100;
    const product: any | null = null;

    let shippingAddress: any | null = null;
    let billingAddress: any | null = null;
    let church: any | null = null;

    if (dto.billingaddressId) {
      billingAddress = await this.prisma.billingAddress.findUnique({
        where: { bill_address_id: Number(dto.billingaddressId) },
      });
    }
    if (dto.shippingaddressId) {
      shippingAddress = await this.prisma.userAddress.findUnique({
        where: { deli_address_id: Number(dto.shippingaddressId) },
      });
    } else if (dto.church_id) {
      church = await this.prisma.church.findUnique({
        where: { church_id: Number(dto.church_id) },
      });
    }
    let OrderCreated: any;

    try {
      //hardcode for demo
      subtotal = product ? Number(product.price) : 100; // fallback ₹100 / $1.00
      // 2️⃣ Ensure subtotal > 0

      // 1️⃣ Create Order in DB
      const order = await this.orderservice.create({
        User_id: user_id,
        orderNumber: generateOrderIdforProduct(),
        status: 'pending',
        totalAmount: subtotal,
        shippingAddressId: Number(dto.shippingaddressId) ?? null,
        billingAddressId: Number(dto.billingaddressId) ?? null,
        church_id: Number(dto.church_id) ?? null,
        memoryProfileId: profile.slug,
        tracking_details: undefined,
        delivery_agent_id: undefined,
      });
      if (subtotal <= 0) {
        throw new Error(
          'Subtotal must be greater than 0 to create a payment intent',
        );
      }

      const checkoutSession =
        await this.stripeService.createCheckoutLinkForExistingOrder(
          order,
          email,
          successUrl || this.getDefaultUrl('/booking/success'),
          cancelUrl || this.getDefaultUrl('/booking/cancel'),
        );

      OrderCreated = {
        id: order.id,
        orderNumber: order.orderNumber,
        memoryProfile: `https://api.magnoliatouch.com/memories?code=${profile.slug}`,
        shipping_name: shippingAddress?.Name ?? '',
        shipping_street: shippingAddress?.street ?? '',
        shipping_city: shippingAddress?.town_or_city ?? '',
        shipping_country: shippingAddress?.country ?? '',
        shipping_postcode: shippingAddress?.postcode ?? '',
        billing_name: billingAddress?.Name ?? '',
        billing_street: billingAddress?.street ?? '',
        billing_city: billingAddress?.town_or_city ?? '',
        billing_country: billingAddress?.country ?? '',
        billing_postcode: billingAddress?.postcode ?? '',
        church_name: church?.name ?? '',
        church_city: church?.city ?? '',
        church_state: church?.state ?? '',
        church_address: church?.address ?? '',
        amount: order.totalAmount,
        status: order.status,
        is_bought: order.is_paid,
        checkout_url: checkoutSession.url!,
        session_id: checkoutSession.id,
        payment_status: checkoutSession.payment_status || 'pending',
        expires_at: checkoutSession.expires_at
          ? new Date(checkoutSession.expires_at * 1000).toISOString()
          : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw error;
    }

    //Dekete Draft after Order is Created.
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete child relations
      await tx.biographyDraft.deleteMany({
        where: { deadPersonSlug: slug },
      });

      await tx.galleryDraft.deleteMany({
        where: { deadPersonSlug: slug },
      });

      await tx.familyDraft.deleteMany({
        where: { deadPersonSlug: slug },
      });

      await tx.socialLinksDraft.deleteMany({
        where: { deadPersonSlug: slug },
      });

      await tx.eventsDraft.deleteMany({
        where: { deadPersonSlug: slug },
      });

      // 2. Delete main draft
      await tx.deadPersonProfileDraft.delete({
        where: { slug },
      });
    });

    // Return response only for the first booking
    return {
      message: `Order created successfully with checkout link (Created ${OrderCreated.orderNumber} order internally)`,
      booking: OrderCreated,
      profile,
      status: HttpStatus.OK,
    };
  }

  // CREATE
  async createFamily(slug: string, dto: FamilyDto) {
    return this.prisma.family.create({
      data: {
        ...dto,
        deadPersonProfiles: slug,
      },
    });
  }

  // GET ALL for a profile
  async getAllFamilies(slug: string) {
    return this.prisma.family.findMany({
      where: { deadPersonProfiles: slug },
    });
  }

  // GET BY ID
  async getFamilyById(slug: string, familyId: number) {
    const family = await this.prisma.family.findFirst({
      where: {
        family_id: familyId,
        deadPersonProfiles: slug,
      },
    });

    if (!family) throw new NotFoundException('Family not found');
    return family;
  }

  // UPDATE
  async updateFamily(slug: string, familyId: number, dto: Partial<FamilyDto>) {
    await this.getFamilyById(slug, familyId); // check existence

    return this.prisma.family.update({
      where: { family_id: familyId },
      data: dto,
    });
  }

  // DELETE
  async deleteFamily(slug: string, familyId: number) {
    await this.getFamilyById(slug, familyId);

    return this.prisma.family.delete({
      where: { family_id: familyId },
    });
  }

  // CREATE
  async createEvent(slug: string, dto: EventsDto) {
    return this.prisma.events.create({
      data: {
        ...dto,
        deadPersonProfiles: slug,
      },
    });
  }

  // GET ALL for a profile
  async getAllEvents(slug: string) {
    return this.prisma.events.findMany({
      where: { deadPersonProfiles: slug },
      orderBy: { year: 'asc' }, // Optional: makes timeline sorted
    });
  }

  // GET BY ID
  async getEventById(slug: string, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id: eventId,
        deadPersonProfiles: slug,
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    return event;
  }

  // UPDATE
  async updateEvent(slug: string, eventId: number, dto: Partial<EventsDto>) {
    await this.getEventById(slug, eventId); // validate existence

    return this.prisma.events.update({
      where: { id: eventId },
      data: dto,
    });
  }

  // DELETE
  async deleteEvent(slug: string, eventId: number) {
    await this.getEventById(slug, eventId);

    return this.prisma.events.delete({
      where: { id: eventId },
    });
  }

  // Update profile picture
  async updateProfileImage(slug: string, email: string, url: string) {
    const profile = await this.prisma.deadPersonProfile.findFirst({
      where: {
        slug,
        owner_id: email,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('Not authorized to edit this profile');
    }

    return this.prisma.deadPersonProfile.update({
      where: { profile_id: profile.profile_id },
      data: { profile_image: url },
    });
  }

  // Update background image
  async updateBackgroundImage(slug: string, email: string, url: string) {
    const profile = await this.prisma.deadPersonProfile.findFirst({
      where: {
        slug,
        owner_id: email,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('Not authorized to edit this profile');
    }

    return this.prisma.deadPersonProfile.update({
      where: { profile_id: profile.profile_id },
      data: { background_image: url },
    });
  }

  async getDraftBySlug(slug: string, email: string, user_id: number) {
    const draft = await this.prisma.deadPersonProfileDraft.findUnique({
      where: { slug },
      include: {
        biography: true,
        gallery: true,
        family: true,
        socialLinks: true,
        events: true,
      },
    });

    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    // Ownership check → only owner can access it
    if (draft.owner_id !== email) {
      throw new ForbiddenException('You are not allowed to access this draft');
    }

    return {
      message: 'Draft fetched successfully',
      draft,
    };
  }

  async updateDeadPersonProfile(
    dto: CreateProfileDto,
    email: string,
    user_id: number,
    existingSlug: string,
  ) {
    let profile: any = null;

    //fetch the profile.
    profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: existingSlug, owner_id: email },
      include: {
        biography: true,
        gallery: true,
        family: true,
        SocialLinks: true,
        Events: true,
      },
    });

    //throw error if profile not found.
    if (!profile) {
      throw new BadRequestException('Draft profile not found');
    }

    // ---------- UPDATE PROFILE ------------------
    const updated = await this.prisma.deadPersonProfile.update({
      where: { slug: existingSlug },
      data: {
        firstName: dto.firstName ?? profile.firstName,
        lastName: dto.lastName ?? profile.lastName,
        born_date: dto.born_date ?? profile.born_date,
        death_date: dto.death_date ?? profile.death_date,
        memorial_place: dto.memorial_place ?? profile.memorial_place,
        profile_image:
          dto.profile_image === undefined
            ? profile.profile_image   // user intentionally removed image
            : dto.profile_image, // keep or replace

        background_image:
          dto.background_image == undefined
            ? profile.background_image
            : dto.background_image,
        is_paid: false, // Always false for draft

        // Overwrite nested arrays
        biography:
          dto.biography && dto.biography.length > 0
            ? {
              upsert: {
                update: {
                  description: dto.biography[0].discription,
                },
                create: {
                  description: dto.biography[0].discription,
                },
              },
            }
            : undefined,

        gallery: {
          create: (dto.gallery ?? []).map((g) => ({ link: g.link })),
        },
        family: {
          deleteMany: {},
          create: (dto.family ?? []).map((f) => ({
            relationship: f.relationship,
            name: f.name,
          })),
        },
        SocialLinks: {
          deleteMany: {},
          create: (dto.socialLinks ?? []).map((s) => ({
            socialMediaName: s.socialMediaName,
            link: s.link,
          })),
        },
        Events: {
          deleteMany: {},
          create: (dto.events ?? []).map((e) => ({
            year: e.year,
            event: e.event,
          })),
        },
      },
      include: {
        biography: true,
        gallery: true,
        family: true,
        SocialLinks: true,
        Events: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      draft: updated,
    };
  }
}
