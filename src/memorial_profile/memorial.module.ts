// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { MemorialController } from './memorial.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MemorialController],
  providers: [MemorialProfileService, PrismaService],
})
export class MemorialProfileModule {}
