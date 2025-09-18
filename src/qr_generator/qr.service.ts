// src/qr/qr.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class QrService {
  constructor(private readonly s3Service: S3Service) {}

  async generateAndSaveQRCode(link: string, filename: string): Promise<string> {
    try {
      const qrBuffer = await QRCode.toBuffer(link);

      // Upload to S3 instead of saving locally
      const s3Url = await this.s3Service.uploadBuffer(
        qrBuffer,
        `${filename}.png`,
        'image/png',
        'qr-codes'
      );

      return s3Url;
    } catch (error) {
      throw new Error(`Failed to generate and upload QR code: ${error.message}`);
    }
  }
}
