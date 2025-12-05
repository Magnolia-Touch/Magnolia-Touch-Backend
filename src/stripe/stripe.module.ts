import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import { WebhookErrorHandlerService } from './webhook-error-handler.service';
import { OrdersModule } from 'src/orders/orders.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QrModule } from 'src/qr_generator/qr.module';
import { QrService } from 'src/qr_generator/qr.service';
import { S3Module } from 'src/s3/s3.module';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      exports: [StripeService],
      imports: [OrdersModule, PrismaModule, ConfigModule, QrModule, S3Module], // NOT forRoot
      providers: [
        StripeService,
        QrService,
        WebhookService,
        WebhookErrorHandlerService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService) =>
            configService.get<string>('STRIPE_SECRET_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
