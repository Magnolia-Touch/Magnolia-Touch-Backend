import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersModule } from 'src/orders/orders.module';
import { RevenueUtils } from './revenue.utils';

@Module({
    controllers: [RevenueController],
    providers: [RevenueService, PrismaService, RevenueUtils],
    exports: [RevenueService], // optional, if you want to use it in other modules
})
export class RevenueModule { }
