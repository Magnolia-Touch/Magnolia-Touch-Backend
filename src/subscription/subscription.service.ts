import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: SubscriptionDto) {
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        discription: dto.discription,
        Subscription_name: dto.Subscription_name,
        Frequency: dto.Frequency,
        Price: dto.Price,
      },
    });

    return {
      message: 'Subscription plan created successfully',
      data: created,
      status: HttpStatus.CREATED,
    };
  }

  async findAll() {
    const subscriptions = await this.prisma.subscriptionPlan.findMany();

    return {
      message: 'All subscription plans fetched successfully',
      data: subscriptions,
      status: HttpStatus.OK,
    };
  }

  async findOne(id: number) {
    const subscription = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription plan not found');
    }

    return {
      message: 'Subscription plan fetched successfully',
      data: subscription,
      status: HttpStatus.OK,
    };
  }
}
