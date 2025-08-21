// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { MemorialController } from './memorial.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [MemorialController],
  providers: [MemorialProfileService, PrismaService],
})
export class MemorialProfileModule {}
