
import {
  Controller, Post, Body, Query, Get, Patch, Request, Param, ParseIntPipe, Delete, UseInterceptors,
  UploadedFile, UploadedFiles, HttpException, HttpStatus, NotFoundException, BadRequestException,
  HttpCode
} from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { CheckoutDto, CreateProfileDto } from './dto/create-profile.dto';
import { diskStorage } from 'multer';
import { S3Service } from 'src/s3/s3.service';
import { extname } from 'path';
import { EventsDto, FamilyDto } from './dto/childrens.dto';


@Controller('memories')
export class MemorialController {
  constructor(private readonly deadPersonProfileService: MemorialProfileService,
    private readonly s3Service: S3Service,
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @Post('create-memorial-profile')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'profile_image', maxCount: 1 },
  //     { name: 'gallery', maxCount: 10 },
  //   ]),
  // )
  // async create(
  //   @UploadedFiles()
  //   files: {
  //     profile_image?: Express.Multer.File[];
  //     gallery?: Express.Multer.File[];
  //   },
  //   @Body() body: any,
  //   @Body('successUrl') successUrl: string,
  //   @Body('cancelUrl') cancelUrl: string,
  //   @Request() req,
  // ) {
  //   // ─── Validate and Upload profile_image ──────────────────────────────
  //   let profileImageUrl: string | undefined;
  //   const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  //   const maxSize = 5 * 1024 * 1024;

  //   const profileImage = files.profile_image?.[0];
  //   if (profileImage) {
  //     if (!this.s3Service.validateFileType(profileImage, allowedImageTypes)) {
  //       throw new BadRequestException('Invalid profile image type');
  //     }
  //     if (!this.s3Service.validateFileSize(profileImage, maxSize)) {
  //       throw new BadRequestException('Profile image too large');
  //     }
  //     profileImageUrl = await this.s3Service.uploadFile(profileImage, 'profiles');
  //   }

  //   // ─── Validate and Upload gallery files ──────────────────────────────
  //   const galleryUrls: { link: string }[] = [];
  //   if (files.gallery?.length) {
  //     for (const g of files.gallery) {
  //       // check type & size
  //       const isImage = g.mimetype.startsWith('image/');
  //       const isVideo = g.mimetype.startsWith('video/');
  //       if (!isImage && !isVideo) {
  //         throw new BadRequestException('Gallery must be image or video');
  //       }
  //       if (!this.s3Service.validateFileSize(g, 50 * 1024 * 1024)) {
  //         throw new BadRequestException('One of the gallery files is too large (max 50MB)');
  //       }
  //       // choose folder name
  //       const folder = isImage ? 'gallery-images' : 'gallery-videos';
  //       const url = await this.s3Service.uploadFile(g, folder);
  //       galleryUrls.push({ link: url });
  //     }
  //   }

  //   // ─── Parse arrays from body ──────────────────────────────
  //   const biography = body.biography ? JSON.parse(body.biography) : [];
  //   const family = body.family ? JSON.parse(body.family) : [];
  //   const socialLinks = body.socialLinks ? JSON.parse(body.socialLinks) : [];
  //   const events = body.events ? JSON.parse(body.events) : [];
  //   const is_paid = body.is_paid === 'true';

  //   // ─── Build DTO ──────────────────────────────
  //   const dto: CreateProfileDto = {
  //     ...body,
  //     profile_image: profileImageUrl,
  //     biography,
  //     family,
  //     socialLinks,
  //     events,
  //     is_paid,
  //     gallery: galleryUrls,
  //   };

  //   return this.deadPersonProfileService.create(dto, req.user.email, req.user.customer_id, successUrl,
  //     cancelUrl);
  // }

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
    const email = req.user.email
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
    @UploadedFile() image: Express.Multer.File
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
  async updateGuestBook(@Request() req, @Query('code') slug: string, @Query('id', ParseIntPipe) id: number) {
    const email = req.user.email
    return this.deadPersonProfileService.updateGuestBook(email, slug, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete-guestmessages')
  async deleteGuestBook(@Request() req, @Query('code') slug: string, @Query('id', ParseIntPipe) id: number) {
    const email = req.user.email
    return this.deadPersonProfileService.deleteGuestBook(email, slug, id);
  }

  // // CREATE
  // @Post('family/:deadPersonProfile')
  // createFamily(
  //   @Param('deadPersonProfile') slug: string,
  //   @Body() dto: FamilyDto,
  // ) {
  //   return this.deadPersonProfileService.createFamily(slug, dto);
  // }

  // // GET ALL
  // @Get('family/:deadPersonProfile')
  // getAll(@Param('deadPersonProfile') slug: string) {
  //   return this.deadPersonProfileService.getAllFamilies(slug);
  // }

  // // GET BY ID
  // @Get('family/:deadPersonProfile/:familyId')
  // getById(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('familyId', ParseIntPipe) familyId: number,
  // ) {
  //   return this.deadPersonProfileService.getFamilyById(slug, familyId);
  // }

  // // UPDATE
  // @Patch('family/:deadPersonProfile:familyId')
  // updateFamily(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('familyId', ParseIntPipe) familyId: number,
  //   @Body() dto: Partial<FamilyDto>,
  // ) {
  //   return this.deadPersonProfileService.updateFamily(slug, familyId, dto);
  // }

  // // DELETE
  // @Delete('family/:deadPersonProfile/:familyId')
  // deleteFamily(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('familyId', ParseIntPipe) familyId: number,
  // ) {
  //   return this.deadPersonProfileService.deleteFamily(slug, familyId);
  // }

  // // CREATE
  // @Post('events/:deadPersonProfile')
  // createEvent(
  //   @Param('deadPersonProfile') slug: string,
  //   @Body() dto: EventsDto,
  // ) {
  //   return this.deadPersonProfileService.createEvent(slug, dto);
  // }

  // // GET ALL
  // @Get('events/:deadPersonProfile')
  // getAllEvents(@Param('deadPersonProfile') slug: string) {
  //   return this.deadPersonProfileService.getAllEvents(slug);
  // }

  // // GET BY ID
  // @Get('events/:deadPersonProfile/:eventId')
  // getByIdEvents(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('eventId', ParseIntPipe) eventId: number,
  // ) {
  //   return this.deadPersonProfileService.getEventById(slug, eventId);
  // }

  // // UPDATE
  // @Patch('events/:deadPersonProfile/:eventId')
  // updateEvent(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('eventId', ParseIntPipe) eventId: number,
  //   @Body() dto: Partial<EventsDto>,
  // ) {
  //   return this.deadPersonProfileService.updateEvent(slug, eventId, dto);
  // }

  // // DELETE
  // @Delete('events/:deadPersonProfile/:eventId')
  // deleteEvent(
  //   @Param('deadPersonProfile') slug: string,
  //   @Param('eventId', ParseIntPipe) eventId: number,
  // ) {
  //   return this.deadPersonProfileService.deleteEvent(slug, eventId);
  // }



  // @UseGuards(JwtAuthGuard)
  // @Post('add-media')
  // @UseInterceptors(FileInterceptor('media'))
  // async addGalleryItems(
  //   @Request() req,
  //   @Query('code') slug: string,
  //   @Query('mediatype') relation: string,
  //   @UploadedFile() media: Express.Multer.File

  // ) {
  //   const email = req.user.email;
  //   return this.deadPersonProfileService.addGalleryItems(email, slug, relation, media);
  // }

  // @Get('by-code-gallery')
  // async getGallery(@Query('code') slug: string) {
  //   return this.deadPersonProfileService.getGallery(slug);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('delete-media')
  // async deleteGalleryItems(
  //   @Request() req,
  //   @Query('code') slug: string,
  //   @Query('mediatype') relation: string,
  //   @Query('id', ParseIntPipe) id: number,
  // ) {
  //   const email = req.user.email;
  //   return this.deadPersonProfileService.deleteGalleryItems(email, slug, relation, id);
  // }

  // // New S3-integrated endpoints
  // @UseGuards(JwtAuthGuard)
  // @Post('upload-profile-image')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadProfileImage(
  //   @Request() req,
  //   @Query('code') slug: string,
  //   @Query('type') type: 'profile' | 'background',
  //   @UploadedFile() image: Express.Multer.File
  // ) {
  //   const email = req.user.email;
  //   return this.deadPersonProfileService.uploadProfileImage(email, slug, type, image);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('upload-media')
  // @UseInterceptors(FileInterceptor('media'))
  // async uploadMedia(
  //   @Request() req,
  //   @Query('code') slug: string,
  //   @Query('mediatype') mediatype: string,
  //   @UploadedFile() media: Express.Multer.File
  // ) {
  //   const email = req.user.email;
  //   return this.deadPersonProfileService.uploadMedia(email, slug, mediatype, media);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('upload-multiple-media')
  // @UseInterceptors(FilesInterceptor('media', 10)) // Allow up to 10 files
  // async uploadMultipleMedia(
  //   @Request() req,
  //   @Query('code') slug: string,
  //   @Query('mediatype') mediatype: string,
  //   @UploadedFiles() media: Express.Multer.File[]
  // ) {
  //   const email = req.user.email;
  //   return this.deadPersonProfileService.uploadMultipleMedia(email, slug, mediatype, media);
  // }

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
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    const profileImage = files.profile_image?.[0];
    if (profileImage) {
      if (!this.s3Service.validateFileType(profileImage, allowedImageTypes)) {
        throw new BadRequestException('Invalid profile image type');
      }
      if (!this.s3Service.validateFileSize(profileImage, maxSize)) {
        throw new BadRequestException('Profile image too large');
      }
      profileImageUrl = await this.s3Service.uploadFile(profileImage, 'profiles');
    }
    const backgroundImage = files.background_image?.[0];
    if (backgroundImage) {
      if (!this.s3Service.validateFileType(backgroundImage, allowedImageTypes)) {
        throw new BadRequestException('Invalid Background image type');
      }
      if (!this.s3Service.validateFileSize(backgroundImage, maxSize)) {
        throw new BadRequestException('Invalid Background image too large');
      }
      backgroundImageUrl = await this.s3Service.uploadFile(backgroundImage, 'backgroundImage');
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
          throw new BadRequestException('One of the gallery files is too large (max 50MB)');
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

    return this.deadPersonProfileService.saveDraftProfile(
      dto,
      req.user.email,
      req.user.customer_id,
      slug // if slug provided → update draft
    );
  }


  @UseGuards(JwtAuthGuard)
  @Post('submit-draft')
  @UseInterceptors(AnyFilesInterceptor())
  async submitDraftController(
    @Body() dto: CheckoutDto,
    @Request() req,
  ) {

    const slug = dto.slug
    console.log("Slug received:", slug);

    if (!slug) {
      throw new BadRequestException("Slug is required");
    }

    return this.deadPersonProfileService.submitDraft(
      req.user.email,
      req.user.customer_id,
      dto
    );
  }


  // --- Update Profile Image ---
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException("No image file uploaded");
    }

    const email = req.user.email;
    console.log(email)
    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException("Only JPEG/PNG/WEBP images allowed");
    }

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException("Image too large (max 10MB)");
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
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException("No image file uploaded");
    }

    const email = req.user.email;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException("Only JPEG/PNG/WEBP images allowed");
    }

    if (!this.s3Service.validateFileSize(file, maxSize)) {
      throw new BadRequestException("Image too large (max 15MB)");
    }

    // Upload to S3
    const url = await this.s3Service.uploadFile(file, 'background-images');

    return this.deadPersonProfileService.updateBackgroundImage(slug, email, url);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-draft/:slug')
  async getDraft(
    @Param('slug') slug: string,
    @Request() req,
  ) {
    return this.deadPersonProfileService.getDraftBySlug(
      slug,
      req.user.email,          // owner email
      req.user.customer_id,    // owner id
    );
  }

}


