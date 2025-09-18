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

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available app-wide
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
    StripeModule.forRootAsync()], 
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
