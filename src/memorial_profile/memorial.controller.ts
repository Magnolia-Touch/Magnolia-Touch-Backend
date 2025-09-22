
import { Controller, Post, Body, Query, Get, Patch, Request, Param, ParseIntPipe, Delete, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { CreateDeadPersonProfileDto } from './dto/memorial_profile.dto';
import { CreateFamilyMemberDto } from './dto/create-family.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateProfileDto } from './dto/create-profile.dto';



@Controller('memories')
export class MemorialController {
  constructor(private readonly deadPersonProfileService: MemorialProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create-memorial-profile')
  async create(
    @Body() dto: CreateProfileDto,
    @Request() req
  ) {
    return this.deadPersonProfileService.create(dto, req.user.email);
  }


  @Get('')
  async getBySlug(@Query('code') slug: string) {
    return this.deadPersonProfileService.getProfile(slug);
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

}

