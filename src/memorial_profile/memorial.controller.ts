
import {
  Controller, Post, Body, Query, Get, Patch, Request, Param, ParseIntPipe, Delete, UseInterceptors,
  UploadedFile, UploadedFiles, HttpException, HttpStatus, NotFoundException, BadRequestException
} from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { CreateDeadPersonProfileDto } from './dto/memorial_profile.dto';
import { CreateFamilyMemberDto } from './dto/create-family.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateProfileDto } from './dto/create-profile.dto';
import { diskStorage } from 'multer';
import { S3Service } from 'src/s3/s3.service';
import { extname } from 'path';


@Controller('memories')
export class MemorialController {
  constructor(private readonly deadPersonProfileService: MemorialProfileService,
    private readonly s3Service: S3Service,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('create-memorial-profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profile_image', maxCount: 1 },
      { name: 'gallery', maxCount: 10 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() body: any,
    @Request() req,
  ) {
    // ─── Validate and Upload profile_image ──────────────────────────────
    let profileImageUrl: string | undefined;
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

    // ─── Validate and Upload gallery files ──────────────────────────────
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

    // ─── Parse arrays from body ──────────────────────────────
    const biography = body.biography ? JSON.parse(body.biography) : [];
    const family = body.family ? JSON.parse(body.family) : [];
    const socialLinks = body.socialLinks ? JSON.parse(body.socialLinks) : [];
    const events = body.events ? JSON.parse(body.events) : [];
    const is_paid = body.is_paid === 'true';

    // ─── Build DTO ──────────────────────────────
    const dto: CreateProfileDto = {
      ...body,
      profile_image: profileImageUrl,
      biography,
      family,
      socialLinks,
      events,
      is_paid,
      gallery: galleryUrls,
    };

    return this.deadPersonProfileService.create(dto, req.user.email);
  }

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
  async getGuestBookApproved(@Query('code') slug: string) {
    return this.deadPersonProfileService.getGuestBookApproved(slug);
  }


  @UseGuards(JwtAuthGuard)
  @Get('unapproved-guestmessages')
  async getGuestBookUnApproved(@Request() req, @Query('code') slug: string) {
    const email = req.user.email
    return this.deadPersonProfileService.getGuestBookUnApproved(email, slug);
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


  @UseGuards(JwtAuthGuard)
  @Post('add-family-member')
  async addFamilyMember(
    @Request() req,
    @Query('code') slug: string,
    @Query('relation') relation: string,
    @Body() body: CreateFamilyMemberDto
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.addFamilyMembers(email, slug, relation, body);
  }

  @Get('by-code-family')
  async getFamily(@Query('code') slug: string) {
    return this.deadPersonProfileService.getFamily(slug);
  }


  @Get('get-family-by')
  async getFamilyById(
    @Request() req,
    @Query('code') slug: string,
    @Query('relation') relation: string,
    @Query('id', ParseIntPipe) id: number
  ) {

    return this.deadPersonProfileService.getFamilybyId(slug, relation, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-family-member')
  async updateMember(
    @Query('code') slug: string,
    @Query('relation') relation: string,
    @Query('id', ParseIntPipe) id: number,
    @Body() body: CreateFamilyMemberDto,
    @Request() req
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.updateFamilybyId(email, slug, relation, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-family-member')
  async deleteMember(
    @Query('code') slug: string,
    @Query('relation') relation: string,
    @Query('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.deleteFamilybyId(email, slug, relation, id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('add-media')
  @UseInterceptors(FileInterceptor('media'))
  async addGalleryItems(
    @Request() req,
    @Query('code') slug: string,
    @Query('mediatype') relation: string,
    @UploadedFile() media: Express.Multer.File

  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.addGalleryItems(email, slug, relation, media);
  }

  @Get('by-code-gallery')
  async getGallery(@Query('code') slug: string) {
    return this.deadPersonProfileService.getGallery(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-media')
  async deleteGalleryItems(
    @Request() req,
    @Query('code') slug: string,
    @Query('mediatype') relation: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.deleteGalleryItems(email, slug, relation, id);
  }

  // New S3-integrated endpoints
  @UseGuards(JwtAuthGuard)
  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @Request() req,
    @Query('code') slug: string,
    @Query('type') type: 'profile' | 'background',
    @UploadedFile() image: Express.Multer.File
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.uploadProfileImage(email, slug, type, image);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-media')
  @UseInterceptors(FileInterceptor('media'))
  async uploadMedia(
    @Request() req,
    @Query('code') slug: string,
    @Query('mediatype') mediatype: string,
    @UploadedFile() media: Express.Multer.File
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.uploadMedia(email, slug, mediatype, media);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-multiple-media')
  @UseInterceptors(FilesInterceptor('media', 10)) // Allow up to 10 files
  async uploadMultipleMedia(
    @Request() req,
    @Query('code') slug: string,
    @Query('mediatype') mediatype: string,
    @UploadedFiles() media: Express.Multer.File[]
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.uploadMultipleMedia(email, slug, mediatype, media);
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
}

