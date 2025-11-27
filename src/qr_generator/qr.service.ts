// src/qr/qr.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { S3Service } from '../s3/s3.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QrService {
  constructor(private readonly s3Service: S3Service,
    private prisma: PrismaService

  ) { }

  async generateAndSaveQRCode(link: string, filename: string): Promise<{ url: string }> {
    try {
      const qrBuffer = await QRCode.toBuffer(link);


      // Upload to S3 instead of saving locally
      const s3Url = await this.s3Service.uploadBuffer(
        qrBuffer,
        `${filename}.png`,
        'image/png',
        'qr-codes'
      );
      await this.prisma.qrCode.create({
        data: { filename, url: s3Url }
      });
      // Return JSON instead of plain string
      return { url: s3Url };
    } catch (error) {
      throw new Error(`Failed to generate and upload QR code: ${error.message}`);
    }
  }

  // 👇 New function to check existence
  async checkQRCodeExists(slug: string): Promise<{ exists: boolean; url?: string }> {
    const key = `qr-codes/${slug}.png`;

    const exists = await this.s3Service.fileExists(key);

    if (exists) {
      const url = this.s3Service.getPublicUrl(key);
      return { exists: true, url };
    }

    return { exists: false };


  }
  async getQrCode(filename: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { filename: filename }
    });

    if (!qr) {
      return null;
    }

    return qr; // contains { id, filename, url, ... }
  }

}
