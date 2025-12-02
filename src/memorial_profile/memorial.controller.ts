import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Request,
  Param,
  ParseIntPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { CheckoutDto, CreateProfileDto } from './dto/create-profile.dto';
import { S3Service } from 'src/s3/s3.service';

@Controller('memories')
export class MemorialController {
  constructor(
    private readonly deadPersonProfileService: MemorialProfileService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('')
  async getBySlug(@Query('code') slug: string) {
    return this.deadPersonProfileService.getProfile(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-memorials')
  async getProfileList(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.getProfileList(
      email,
      Number(page),
      Number(limit),
      search,
    );
  }

  @Post('add-guestbook')
  @UseInterceptors(FileInterceptor('image'))
  async addGuestBook(
    @Request() req,
    @Query('code') slug: string,
    @Body() body: CreateGuestBookDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.deadPersonProfileService.addGuestbook(slug, body, image);
  }

  @Get('guestmessages')
  async getGuestBookApproved(
    @Query('code') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.deadPersonProfileService.getGuestBookApproved(
      slug,
      Number(page),
      Number(limit),
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unapproved-guestmessages')
  async getGuestBookUnApproved(
    @Request() req,
    @Query('code') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.getGuestBookUnApproved(
      email,
      slug,
      Number(page),
      Number(limit),
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('approve-guestmessages')
  async updateGuestBook(
    @Request() req,
    @Query('code') slug: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.updateGuestBook(email, slug, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete-guestmessages')
  async deleteGuestBook(
    @Request() req,
    @Query('code') slug: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.deleteGuestBook(email, slug, id);
  }

  @Get('profiles')
  async getAllMemoryProfile(@Query() query: any) {
    try {
      return await this.deadPersonProfileService.getAllMemoryProfile(query);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch profiles',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('profiles/:id') // <-- GET by ID
  async getMemoryProfileById(@Param('id') id: string) {
    try {
      return await this.deadPersonProfileService.getMemoryProfileById(id);
    } catch (error) {
      // Pass through NotFoundException or throw generic error
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to fetch profile with ID ${id}`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('counts')
  async getBookingCounts(@Query('date') date: string) {
    return this.deadPersonProfileService.bookingCounts(date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save-draft')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profile_image', maxCount: 1 },
      { name: 'background_image', maxCount: 1 },
      { name: 'gallery', maxCount: 10 },
    ]),
  )
  async saveDraft(
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
      background_image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body('slug') slug: string,
    @Body() body: any,
    @Request() req,
  ) {
    // Same image upload logic as main create API
    let profileImageUrl: string | undefined;
    let backgroundImageUrl: string | undefined;
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const maxSize = 5 * 1024 * 1024;

    const profileImage = files.profile_image?.[0];
    if (profileImage) {
      if (!this.s3Service.validateFileType(profileImage, allowedImageTypes)) {
        throw new BadRequestException('Invalid profile image type');
      }
      if (!this.s3Service.validateFileSize(profileImage, maxSize)) {
        throw new BadRequestException('Profile image too large');
      }
      profileImageUrl = await this.s3Service.uploadFile(
        profileImage,
        'profiles',
      );
    }
    const backgroundImage = files.background_image?.[0];
    if (backgroundImage) {
      if (
        !this.s3Service.validateFileType(backgroundImage, allowedImageTypes)
      ) {
        throw new BadRequestException('Invalid Background image type');
      }
      if (!this.s3Service.validateFileSize(backgroundImage, maxSize)) {
        throw new BadRequestException('Invalid Background image too large');
      }
      backgroundImageUrl = await this.s3Service.uploadFile(
        backgroundImage,
        'backgroundImage',
      );
    }

    // gallery uploads
    const galleryUrls: { link: string }[] = [];
    if (files.gallery?.length) {
      for (const g of files.gallery) {
        // check type & size
        const isImage = g.mimetype.startsWith('image/');
        const isVideo = g.mimetype.startsWith('video/');
        if (!isImage && !isVideo) {
          throw new BadRequestException('Gallery must be image or video');
        }
        if (!this.s3Service.validateFileSize(g, 50 * 1024 * 1024)) {
          throw new BadRequestException(
            'One of the gallery files is too large (max 50MB)',
          );
        }
        // choose folder name
        const folder = isImage ? 'gallery-images' : 'gallery-videos';
        const url = await this.s3Service.uploadFile(g, folder);
        galleryUrls.push({ link: url });
      }
    }

    // Parse JSON arrays
    const biography = body.biography ? JSON.parse(body.biography) : [];
    const family = body.family ? JSON.parse(body.family) : [];
    const socialLinks = body.socialLinks ? JSON.parse(body.socialLinks) : [];
    const events = body.events ? JSON.parse(body.events) : [];

    const dto: CreateProfileDto = {
      ...body,
      profile_image: profileImageUrl,
      background_image: backgroundImageUrl,
      biography,
      family,
      socialLinks,
      events,
      is_paid: false,
      gallery: galleryUrls,
    };
    console.log('usermeail', req.user.email);
    return this.deadPersonProfileService.saveDraftProfile(
      dto,
      req.user.email,
      req.user.customer_id,
      slug, // if slug provided → update draft
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit-draft')
  @UseInterceptors(AnyFilesInterceptor())
  async submitDraftController(@Body() dto: CheckoutDto, @Request() req) {
    const slug = dto.slug;
    console.log('Slug received:', slug);

    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    return this.deadPersonProfileService.submitDraft(
      req.user.email,
      req.user.customer_id,
      dto,
    );
  }

  // --- Update Profile Image ---
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    const email = req.user.email;
    console.log(email);
    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG/PNG/WEBP images allowed');
    }

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('Image too large (max 10MB)');
    }

    // Upload to S3
    const url = await this.s3Service.uploadFile(file, 'profile-images');

    return this.deadPersonProfileService.updateProfileImage(slug, email, url);
  }

  // --- Update Background Image ---
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/background-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateBackgroundImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    const email = req.user.email;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG/PNG/WEBP images allowed');
    }

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException('Image too large (max 15MB)');
    }

    // Upload to S3
    const url = await this.s3Service.uploadFile(file, 'background-images');

    return this.deadPersonProfileService.updateBackgroundImage(
      slug,
      email,
      url,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-draft/:slug')
  async getDraft(@Param('slug') slug: string, @Request() req) {
    return this.deadPersonProfileService.getDraftBySlug(
      slug,
      req.user.email, // owner email
      req.user.customer_id, // owner id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profile_image', maxCount: 1 },
      { name: 'background_image', maxCount: 1 },
      { name: 'gallery', maxCount: 10 },
    ]),
  )
  async updateDeadPersonProfile(
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
      background_image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Query('slug') slug: string,
    @Body() body: any,
    @Request() req,
  ) {
    // Same image upload logic as main create API
    let profileImageUrl: string | undefined;
    let backgroundImageUrl: string | undefined;
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const maxSize = 5 * 1024 * 1024;

    const profileImage = files.profile_image?.[0];
    if (profileImage) {
      if (!this.s3Service.validateFileType(profileImage, allowedImageTypes)) {
        throw new BadRequestException('Invalid profile image type');
      }
      if (!this.s3Service.validateFileSize(profileImage, maxSize)) {
        throw new BadRequestException('Profile image too large');
      }
      profileImageUrl = await this.s3Service.uploadFile(
        profileImage,
        'profiles',
      );
    }
    const backgroundImage = files.background_image?.[0];
    if (backgroundImage) {
      if (
        !this.s3Service.validateFileType(backgroundImage, allowedImageTypes)
      ) {
        throw new BadRequestException('Invalid Background image type');
      }
      if (!this.s3Service.validateFileSize(backgroundImage, maxSize)) {
        throw new BadRequestException('Invalid Background image too large');
      }
      backgroundImageUrl = await this.s3Service.uploadFile(
        backgroundImage,
        'backgroundImage',
      );
    }

    // gallery uploads
    const galleryUrls: { link: string }[] = [];
    if (files.gallery?.length) {
      for (const g of files.gallery) {
        // check type & size
        const isImage = g.mimetype.startsWith('image/');
        const isVideo = g.mimetype.startsWith('video/');
        if (!isImage && !isVideo) {
          throw new BadRequestException('Gallery must be image or video');
        }
        if (!this.s3Service.validateFileSize(g, 50 * 1024 * 1024)) {
          throw new BadRequestException(
            'One of the gallery files is too large (max 50MB)',
          );
        }
        // choose folder name
        const folder = isImage ? 'gallery-images' : 'gallery-videos';
        const url = await this.s3Service.uploadFile(g, folder);
        galleryUrls.push({ link: url });
      }
    }

    // Parse JSON arrays
    const biography = body.biography ? JSON.parse(body.biography) : [];
    const family = body.family ? JSON.parse(body.family) : [];
    const socialLinks = body.socialLinks ? JSON.parse(body.socialLinks) : [];
    const events = body.events ? JSON.parse(body.events) : [];

    const dto: CreateProfileDto = {
      ...body,
      profile_image: profileImageUrl,
      background_image: backgroundImageUrl,
      biography,
      family,
      socialLinks,
      events,
      is_paid: false,
      gallery: galleryUrls,
    };
    console.log('usermeail', req.user.email);
    return this.deadPersonProfileService.updateDeadPersonProfile(
      dto,
      req.user.email,
      req.user.customer_id,
      slug, // if slug provided → update draft
    );
  }
}
