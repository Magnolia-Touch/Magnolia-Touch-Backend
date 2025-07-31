// src/qr/qr.module.ts
import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';

@Module({
  providers: [QrService],
  controllers: [QrController],
})
export class QrModule {}
