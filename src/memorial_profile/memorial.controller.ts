
import { Controller, Post, Body, Query, Get, Patch, Req, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { CreateDeadPersonProfileDto } from './dto/memorial_profile.dto';
import { CreateFamilyMemberDto } from './dto/create-family.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { CreateGuestBookDto } from './dto/create-guestbook.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';

@Controller('memories')
export class MemorialController {
  constructor(private readonly deadPersonProfileService: MemorialProfileService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create-memorial-profile')
  async create(
    @Body() dto: Partial<CreateDeadPersonProfileDto>,
    @Query('email') email: string
  ) {
    return this.deadPersonProfileService.create(dto, email);
  }

  
  @Get('by-code')
  async getBySlug(@Query('code') slug: string) {
    return this.deadPersonProfileService.getProfile(slug);
  }


  @Post('add-guestbook')
  async addGuestBook(
    @Req() req,
    @Query('code') slug: string,
    @Body() body: CreateGuestBookDto
  ) {
    return this.deadPersonProfileService.addGuestbook(slug, body);
  }


  @Get('guestmessages')
  async getGuestBookApproved(@Query('code') slug: string) {
    return this.deadPersonProfileService.getGuestBookApproved(slug);
  }


  @UseGuards(JwtAuthGuard)
  @Get('unapproved-guestmessages')
  async getGuestBookUnApproved(@Req() req, @Query('code') slug: string) {
    const email = req.user.email
    return this.deadPersonProfileService.getGuestBookUnApproved(email, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('approve-guestmessages')
  async updateGuestBook(@Req() req, @Query('code') slug: string, @Query('id', ParseIntPipe) id: number) {
    const email = req.user.email
    return this.deadPersonProfileService.updateGuestBook(email, slug, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete-guestmessages')
  async deleteGuestBook(@Req() req, @Query('code') slug: string, @Query('id', ParseIntPipe) id: number) {
    const email = req.user.email
    return this.deadPersonProfileService.deleteGuestBook(email, slug, id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('add-family-member')
  async addFamilyMember(
    @Req() req,
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
    @Req() req,
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
    @Req() req
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
    @Req() req
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.deleteFamilybyId(email, slug, relation, id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('add-media')
  async addGalleryItems(
    @Req() req,
    @Query('code') slug: string,
    @Query('mediatype') relation: string,
    @Body() body: CreateGalleryDto
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.addGalleryItems(email, slug, relation, body);
  }

  @Get('by-code-gallery')
  async getGallery(@Query('code') slug: string) {
    return this.deadPersonProfileService.getGallery(slug);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('delete-media')
  async deleteGalleryItems(
    @Req() req,
    @Query('code') slug: string,
    @Query('mediatype') relation: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    const email = req.user.email;
    return this.deadPersonProfileService.deleteGalleryItems(email, slug, relation, id);
  }
  
}


// todo: 
// family -- completed
//make proper error handling
// retrieve, update and delete for biography, family, guestbook and gallery

// guestbook
// guestbook can be added -- done
// guestbook message without approval view by profile owner -- done
// guestbook message with approval View by anyone --done
// delete guestbook message by profile owner -- done
// update guestbook for change approve guestmessges -- done

//gallery
