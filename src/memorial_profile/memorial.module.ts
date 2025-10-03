// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { MemorialController } from './memorial.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';
import { OrdersModule } from 'src/orders/orders.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [S3Module, OrdersModule, StripeModule.forRootAsync()],
  controllers: [MemorialController],
  providers: [MemorialProfileService, PrismaService],
})
export class MemorialProfileModule { }
