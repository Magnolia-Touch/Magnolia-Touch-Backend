import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookingController } from './booking.controller';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
    imports: [PrismaModule, StripeModule.forRootAsync()],
    providers: [BookingService],
    exports: [BookingService],
    controllers: [BookingController]
}) export class BookingModule {}
