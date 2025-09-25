import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) { }

  async create(dto: SubscriptionDto) {
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        discription: dto.discription,
        Subscription_name: dto.Subscription_name,
        Frequency: dto.Frequency,
        Price: dto.Price,
        isSubscriptionPlan: dto.isSubscriptionPlan
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

  // Update a subscription plan (PATCH)
  async updateSubscriptionPlan(
    id: number,
    dto: Partial<SubscriptionDto>, // allows partial updates
  ) {
    const updated = await this.prisma.subscriptionPlan.update({
      where: { Subscription_id: id },
      data: {
        discription: dto.discription,
        Subscription_name: dto.Subscription_name,
        Frequency: dto.Frequency,
        Price: dto.Price,
        isSubscriptionPlan: dto.isSubscriptionPlan,
      },
    });

    return {
      message: 'Subscription plan updated successfully',
      data: updated,
      status: HttpStatus.OK,
    };
  }

  // Delete a subscription plan
  async deleteSubscriptionPlan(id: number) {
    await this.prisma.subscriptionPlan.delete({
      where: { Subscription_id: id },
    });

    return {
      message: 'Subscription plan deleted successfully',
      status: HttpStatus.OK,
    };
  }

}
