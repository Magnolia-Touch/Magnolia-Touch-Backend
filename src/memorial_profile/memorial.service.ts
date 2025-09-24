import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateDeadPersonProfileDto } from './dto/memorial_profile.dto';
import { CreateFamilyMemberDto } from './dto/create-family.dto';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { generateCode } from 'src/utils/code-generator.util'; // adjust path if needed
import { HttpStatus } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { contains } from 'class-validator';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MemorialProfileService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private emailService: MailerService
  ) { }

  async create(dto: CreateProfileDto, email: string) {
    // generate unique slug
    let uniqueSlug = '';
    let isUnique = false;
    while (!isUnique) {
      const tempSlug = generateCode();
      const existing = await this.prisma.deadPersonProfile.findUnique({
        where: { slug: tempSlug },
      });
      if (!existing) {
        uniqueSlug = tempSlug;
        isUnique = true;
      }
    }

    // main profile
    const profile = await this.prisma.deadPersonProfile.create({
      data: {
        owner_id: email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        born_date: dto.born_date,
        death_date: dto.death_date,
        memorial_place: dto.memorial_place,
        profile_image: dto.profile_image,
        background_image: dto.background_image,
        is_paid: dto.is_paid ?? false,
        slug: uniqueSlug,

        // Nested creates
        biography: {
          create: (dto.biography ?? []).map((b) => ({
            discription: b.discription,
          })),
        },
        gallery: {
          create: (dto.gallery ?? []).map((g) => ({
            link: g.link,
          })),
        },
        family: {
          create: (dto.family ?? []).map((f) => ({
            relationship: f.relationship,
            name: f.name,
          })),
        },

        // always create a guestBook
        guestBook: {
          create: {},
        },
        SocialLinks: {
          create: (dto.socialLinks ?? []).map((s) => ({
            socialMediaName: s.socialMediaName, // undefined if not provided
            link: s.link,
          })),
        },
        Events: {
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
        guestBook: { include: { guestBookItems: true } },
        SocialLinks: true,
        Events: true,
      },
    });

    return profile;
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
        SocialLinks: true
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


  async addGuestbook(slug: string, dto: CreateGuestBookDto, image: Express.Multer.File) {
    const { first_name, last_name, guestemail, phone, message } = dto;
    let imageUrl: string | null = null;
    if (image) {
      // Upload image to S3
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!this.s3Service.validateFileType(image, allowedImageTypes)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!this.s3Service.validateFileSize(image, maxSize)) {
        throw new BadRequestException('File size too large. Maximum size is 5MB.');
      }
      imageUrl = await this.s3Service.uploadFile(image, `guestbook/${slug}/images`);
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
        is_approved: false
      },
    });
    return {
      message: `GuestBook entry added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }


  async getGuestBookApproved(slug: string) {
    const profile = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: {
          where: {
            is_approved: true
          }
        }
      }
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

  async getGuestBookUnApproved(email: string, slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: {
          where: {
            is_approved: false
          }
        }
      }
    });
    if (!guestbook) {
      throw new NotFoundException('Guestbook not found for this profile');
    }
    return {
      message: 'Profile fetched successfully',
      data: guestbook,
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

    if (!profile || !profile.gallery.length) {
      throw new NotFoundException('Gallery not found for this profile');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true
      }
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
    })

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
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    const guestbook = await this.prisma.guestBook.findFirst({
      where: { deadPersonProfiles: slug },
      include: {
        guestBookItems: true
      }
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
        console.warn('Failed to delete guestbook photo from S3:', error.message);
      }
    }

    await this.prisma.guestBookItems.delete({
      where: {
        guestbookitems_id: id,
        guestbook_id: guestbook.guestbook_id,
      },
    })

    return {
      message: 'GuestBook item deleted successfully',
      status: HttpStatus.OK,
    };
  }

  //Add family members to the profile
  async addFamilyMembers(email: string, slug: string, relation: string, dto: CreateFamilyMemberDto) {
    const { name } = dto;
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        family: true,
      },
    });
    if (!profile || !profile.family.length) {
      throw new NotFoundException('Family not found for this profile');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    const family_id = profile.family[0].family_id; // assuming one-to-one family
    // Validate relation to prevent arbitrary table access
    const validRelations = [
      'parents', 'siblings', 'cousins', 'friends', 'spouse',
      'nieceAndNephew', 'childrens', 'pets',
      'grandchildrens', 'grandparents', 'greatGrandParents',
    ];
    if (!validRelations.includes(relation)) {
      throw new BadRequestException(`Invalid relation: ${relation}`);
    }
    // Construct Prisma model name dynamically (capitalize first letter)
    const model = {
      nieceAndNephew: 'nieceAndNephew',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandParents: 'greatGrandParents',
      pets: 'pets',
      childrens: 'childrens',
      spouse: 'spouse',
      friends: 'friends',
      cousins: 'cousins',
      siblings: 'siblings',
      parents: 'parents'
    }[relation] ?? relation; // keep consistent for special cases
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    // Create the family member using the appropriate model
    const created = await this.prisma[modelName].create({
      data: {
        name: name,
        family_id,
        deadPersonProfiles: slug,
      },
    });
    return {
      message: `${modelName} member added`,
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  async getFamily(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
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

  async getFamilybyId(slug: string, relation: string, id: number) {
    const validRelations = [
      'parents', 'siblings', 'cousins', 'friends', 'spouse',
      'nieceAndNephew', 'childrens', 'pets',
      'grandchildrens', 'grandparents', 'greatGrandParents',
    ];
    if (!validRelations.includes(relation)) {
      return {
        message: `Invalid relation: ${relation}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
    // Fetch the family by slug, including all possible relations
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug }
    });
    if (!family) {
      throw new NotFoundException('Family not found for this profile');
    }
    const members = family[relation] as any[];
    if (!members || !Array.isArray(members)) {
      throw new NotFoundException(`No ${relation} members found for this profile`);
    }
    const member = members.find((m) => m.id === id);
    if (!member) {
      throw new NotFoundException(`${relation.charAt(0).toUpperCase() + relation.slice(1)} member with ID ${id} not found`);
    }
    return {
      message: 'Family member fetched successfully',
      data: member,
      status: HttpStatus.OK,
    };
  }


  async updateFamilybyId(email: string, slug: string, relation: string, id: number, dto: CreateFamilyMemberDto) {
    const { name } = dto
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug },
    });
    if (!family) {
      throw new Error('Family not found for the provided slug');
    }
    // 2. Define a mapping of relation to corresponding model and update method
    const relationMap: Record<string, string> = {
      parents: 'parents',
      siblings: 'siblings',
      cousins: 'cousins',
      friends: 'friends',
      spouse: 'spouse',
      nieceAndNephew: 'nieceAndNephew',
      childrens: 'childrens',
      pets: 'pets',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandparents: 'greatGrandparents',
    };
    const modelName = relationMap[relation.toLowerCase()];
    if (!modelName) {
      throw new Error(`Invalid relation type: ${relation}`);
    }
    // 3. Update the related record dynamically
    const updated = await this.prisma[modelName].update({
      where: {
        id: id,
        family_id: family.family_id,
      },
      data: {
        name: name,
      },
    });
    return { message: `${relation} updated successfully`, updated };
  }


  async deleteFamilybyId(email: string, slug: string, relation: string, id: number) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email != profile.owner_id) {
      throw new ForbiddenException('You are not authorized to view this guestbook');
    }
    // 1. Find the family using the slug
    const family = await this.prisma.family.findFirst({
      where: { deadPersonProfiles: slug },
    });
    if (!family) {
      throw new NotFoundException('Family not found for the provided slug');

    }
    const relationMap: Record<string, string> = {
      parents: 'parents',
      siblings: 'siblings',
      cousins: 'cousins',
      friends: 'friends',
      spouse: 'spouse',
      nieceAndNephew: 'nieceAndNephew',
      childrens: 'childrens',
      pets: 'pets',
      grandchildrens: 'grandchildrens',
      grandparents: 'grandparents',
      greatGrandParents: 'greatGrandParents',
    };
    const modelName = relationMap[relation.toLowerCase()];
    if (!modelName) {
      throw new Error(`Invalid relation type: ${relation}`);
    }
    await this.prisma[modelName].delete({
      where: {
        id: id,
        family_id: family.family_id,
      },
    });
    return { message: `${relation} member with ID ${id} deleted successfully.` };
  }


  // This method is deprecated - use uploadMedia instead
  async addGalleryItems(email: string, slug: string, mediatype: string, image: Express.Multer.File) {
    // Redirect to the new S3-integrated method
    if (mediatype === 'photos' || mediatype === 'videos') {
      return this.uploadMedia(email, slug, mediatype, image);
    } else if (mediatype === 'links') {
      throw new BadRequestException('Links cannot be uploaded as files. Please use a different endpoint to add link URLs.');
    } else {
      throw new BadRequestException(`Invalid mediatype: ${mediatype}`);
    }
  }


  async getGallery(slug: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug },
      include: {
        gallery: {
          select: { link: true }
        }
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
      throw new ForbiddenException('You are not authorized to view this guestbook');
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
  async uploadProfileImage(email: string, slug: string, type: 'profile' | 'background', file: Express.Multer.File) {
    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!this.s3Service.validateFileType(file, allowedImageTypes)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }

    // Check if user owns the profile
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug }
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (email !== profile.owner_id) {
      throw new ForbiddenException('You are not authorized to update this profile');
    }

    // Upload to S3
    const folder = `profiles/${slug}/${type}-images`;
    const imageUrl = await this.s3Service.uploadFile(file, folder);

    // Delete old image from S3 if it exists
    const oldImageUrl = type === 'profile' ? profile.profile_image : profile.background_image;
    if (oldImageUrl) {
      try {
        await this.s3Service.deleteFile(oldImageUrl);
      } catch (error) {
        console.warn('Failed to delete old image from S3:', error.message);
      }
    }

    // Update profile with new image URL
    const updateData = type === 'profile'
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

  async uploadMedia(email: string, slug: string, mediatype: string, file: Express.Multer.File) {
    // Validate mediatype
    const validMediaTypes = ['photos', 'videos'];
    if (!validMediaTypes.includes(mediatype.toLowerCase())) {
      throw new BadRequestException('Invalid mediatype. Only photos and videos are supported for file uploads.');
    }

    // Validate file type based on mediatype
    let allowedTypes: string[];
    if (mediatype.toLowerCase() === 'photos') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else {
      allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    }

    if (!this.s3Service.validateFileType(file, allowedTypes)) {
      throw new BadRequestException(`Invalid file type for ${mediatype}.`);
    }

    // Validate file size (50MB for videos, 10MB for photos)
    const maxSize = mediatype.toLowerCase() === 'videos' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException(`File size too large. Maximum size is ${mediatype.toLowerCase() === 'videos' ? '50MB' : '10MB'}.`);
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
      throw new ForbiddenException('You are not authorized to upload media to this profile');
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

  async uploadMultipleMedia(email: string, slug: string, mediatype: string, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate mediatype
    const validMediaTypes = ['photos', 'videos'];
    if (!validMediaTypes.includes(mediatype.toLowerCase())) {
      throw new BadRequestException('Invalid mediatype. Only photos and videos are supported for file uploads.');
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
      throw new ForbiddenException('You are not authorized to upload media to this profile');
    }

    // Validate all files
    let allowedTypes: string[];
    if (mediatype.toLowerCase() === 'photos') {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else {
      allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    }

    const maxSize = mediatype.toLowerCase() === 'videos' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    for (const file of files) {
      if (!this.s3Service.validateFileType(file, allowedTypes)) {
        throw new BadRequestException(`Invalid file type for ${file.originalname}. Expected ${mediatype}.`);
      }
      if (!this.s3Service.validateFileSize(file, maxSize)) {
        throw new BadRequestException(`File ${file.originalname} is too large.`);
      }
    }

    // Upload all files to S3
    const folder = `profiles/${slug}/gallery/${mediatype}`;
    const uploadedUrls = await this.s3Service.uploadMultipleFiles(files, folder);

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

    let photoUrl: string | null = null;

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
        profile.firstName || profile.lastName // adjust based on your DB field
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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
        guestBook: true
      }
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

  async sendProfileOwnerNotification(ownerEmail: string, visitorName: string, profileName: string) {
    const subject = `New Memory Shared on ${profileName}`;
    const text = `
    Hi,
    
    One memorial visitor, ${visitorName}, has shared their memory on ${profileName}'s profile.
    
    Please review and approve/deny it to appear publicly on the profile.
    
    Regards,
    Your App Team
    `;

    await this.emailService.sendMail({
      to: ownerEmail,
      subject,
      text,
    });
  }


}
