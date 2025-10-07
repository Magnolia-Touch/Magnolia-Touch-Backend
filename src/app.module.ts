import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FlowersModule } from './flower/flower.module';
import { BookingModule } from './booking/booking.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ChurchModule } from './church/church.module';
import { StripeModule } from './stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { QrModule } from './qr_generator/qr.module';
import { MemorialProfileModule } from './memorial_profile/memorial.module';
import { ServicesModule } from './services/services.module';
import { LogicModule } from './logics/logics.module';
import { OrdersModule } from './orders/orders.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';
import { RevenueModule } from './revenue/revenue.module';
import { ContactFormModule } from './contact-form/contact-form.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // makes ConfigService available app-wide
  }),
  MailerModule.forRoot({
    transport: {
      host: 'smtp.gmail.com',       // your SMTP host
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    },
    defaults: {
      from: '"No Reply" <no-wishyougrowth@gmail.com>',
    },
    template: {
      dir: join(process.cwd(), 'src/templates'), // ✅ absolute path
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    }
  }),

    UserModule,
    AuthModule,
    PrismaModule,
    FlowersModule,
    BookingModule,
    SubscriptionModule,
    ChurchModule,
    FlowersModule,
    CartModule,
    ProductsModule,
    MemorialProfileModule,
    QrModule,
    ServicesModule,
    LogicModule,
    OrdersModule,
    RevenueModule,
    ContactFormModule,
  StripeModule.forRootAsync()],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
