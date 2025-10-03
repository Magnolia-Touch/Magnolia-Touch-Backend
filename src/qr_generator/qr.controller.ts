// src/qr/qr.controller.ts
import { Controller, Post, Body, UseGuards, Query, Get } from '@nestjs/common';
import { QrService } from './qr.service';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) { }


  @Post('generate')
  async saveQrCode(@Body() body: { link: string; filename: string }) {
    const { link, filename } = body;
    return this.qrService.generateAndSaveQRCode(link, filename);
  }

  // GET /qr/check?slug=abc123
  @Get('check')
  async checkQRCode(@Query('slug') slug: string) {
    if (!slug) {
      return { exists: false, message: 'Slug is required' };
    }
    return this.qrService.checkQRCodeExists(slug);
  }
}
