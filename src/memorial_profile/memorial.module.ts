// flowers/flowers.module.ts
import { Module } from '@nestjs/common';
import { MemorialProfileService } from './memorial.service';
import { MemorialController } from './memorial.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Module } from '../s3/s3.module';
import { OrdersModule } from 'src/orders/orders.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { FamilyController } from './family.controller';
import { EventsController } from './events.controller';
import { BiographyController } from './biography.controller';
import { SocialLinksController } from './social-links.controller';
import { FamilyService } from './family.service';
import { EventsService } from './events.service';
import { BiographyService } from './biography.service';
import { SocialLinksService } from './social-links.service';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.sevice';
import { QrService } from 'src/qr_generator/qr.service';

@Module({
  imports: [S3Module, OrdersModule, StripeModule.forRootAsync()],
  controllers: [
    MemorialController,
    FamilyController,
    EventsController,
    BiographyController,
    SocialLinksController,
    GalleryController
  ],
  providers: [
    MemorialProfileService,
    PrismaService,
    FamilyService,
    EventsService,
    BiographyService,
    SocialLinksService,
    GalleryService,
    QrService
  ],
})
export class MemorialProfileModule { }
