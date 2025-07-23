// subscription/subscription.module.ts
import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';


@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, JwtStrategy],
})
export class SubscriptionModule {}

