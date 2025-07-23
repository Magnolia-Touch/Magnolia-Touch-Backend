// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { FlowersService } from './flower.service';
import { FlowersController } from './flower.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FlowersController],
  providers: [FlowersService, PrismaService],
})
export class FlowersModule {}
