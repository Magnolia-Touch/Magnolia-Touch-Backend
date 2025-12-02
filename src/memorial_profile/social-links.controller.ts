import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { SocialLinksDto } from './dto/childrens.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('social-links')
export class SocialLinksController {
  constructor(private socialLinksService: SocialLinksService) {}

  // CREATE
  @UseGuards(JwtAuthGuard)
  @Post(':slug')
  create(
    @Param('slug') slug: string,
    @Body() dto: SocialLinksDto,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.socialLinksService.createSocialLink(slug, dto, email);
  }

  // GET ALL
  @Get(':slug')
  getAll(@Param('slug') slug: string) {
    return this.socialLinksService.getAllSocialLinks(slug);
  }

  // GET BY ID
  @Get(':slug/:id')
  getById(@Param('slug') slug: string, @Param('id', ParseIntPipe) id: number) {
    return this.socialLinksService.getSocialLinkById(slug, id);
  }

  // UPDATE
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/:id')
  update(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<SocialLinksDto>,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.socialLinksService.updateSocialLink(slug, id, dto, email);
  }

  // DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':slug/:id')
  delete(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.socialLinksService.deleteSocialLink(slug, id, email);
  }
}
