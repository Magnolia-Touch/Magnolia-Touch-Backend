// church/church.module.ts
import { Module } from '@nestjs/common';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChurchController],
  providers: [ChurchService, PrismaService],
  exports: [ChurchService],
})
export class ChurchModule {}
