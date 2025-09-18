// order.service.ts
import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateCostDto } from './dto/estimate-cost.dto';
import { stat } from 'fs';

@Injectable()
export class LogicService {
  constructor(private prisma: PrismaService) { }

  async estimateCost(
    dto: EstimateCostDto,
  ) {
    const { church_name, plot_no, city, state, subscription_id, flower_id, first_cleaning_date, second_cleaning_date, anniversary_date, no_of_subsribe_years } = dto;
    const subscribed_plan = await this.prisma.subscriptionPlan.findUnique({
      where: { Subscription_id: subscription_id },
    });
    if (!subscribed_plan) {
      throw new Error('Subscription plan not found');
    }

    const flower = flower_id
      ? await this.prisma.flowers.findUnique({ where: { flower_id } })
      : null;

    let flowerCost = 0
    if (flower) {
      flowerCost = parseInt(flower.Price, 10)
    }
    const planCost = parseInt(subscribed_plan.Price, 10);      // '2000' => 2000
    const total = flowerCost + planCost

    return {
      message: 'Cost estimated successfully',
      data: {
        cemeteryName: church_name,
        plot_no: plot_no,
        city: city,
        state: state,
        chosenPlan: subscribed_plan,
        no_of_subsribe_years: no_of_subsribe_years,
        flower: flower ?? null,
        first_cleaning_date,
        second_cleaning_date,
        anniversary_date,
        totalCost: total,
      },
      status: HttpStatus.OK,
    };
  }
}
