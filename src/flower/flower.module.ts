// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { FlowersService } from './flower.service';
import { FlowersController } from './flower.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [FlowersController],
  providers: [FlowersService, PrismaService],
})
export class FlowersModule {}
