// src/qr/qr.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QrService {
  async generateAndSaveQRCode(link: string, filename: string): Promise<string> {
    try {
      const qrBuffer = await QRCode.toBuffer(link);

      const folderPath = path.join(__dirname, '..', '..', 'qr-images');
      const filePath = path.join(folderPath, `${filename}.png`);

      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      fs.writeFileSync(filePath, qrBuffer);
      return `QR code saved at: ${filePath}`;
    } catch (error) {
      throw new Error(`Failed to save QR code: ${error.message}`);
    }
  }
}
