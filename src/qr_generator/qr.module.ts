// src/qr/qr.module.ts
import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [QrService],
  controllers: [QrController],
  exports: [QrService]
})
export class QrModule { }
