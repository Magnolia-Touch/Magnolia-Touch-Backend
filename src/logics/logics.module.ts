import { Module } from '@nestjs/common';
import { LogicService } from './logics.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogicController } from './logics.controller';

@Module({
  controllers: [LogicController],
  providers: [LogicService, PrismaService],
})
export class LogicModule {}
