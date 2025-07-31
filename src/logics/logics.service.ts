// order.service.ts
import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstimateCostDto } from './dto/estimate-cost.dto';

@Injectable()
export class LogicService {
  constructor(private prisma: PrismaService) {}

  async estimateCost(
    cemeteryId: number,
    planId: number,
    flowerId: number,
    dto: EstimateCostDto,
  ) {
    const { firstCleaningDate, nextCleaningDate, anniversaryDate, nameOnBouquet } = dto;

    const cemetery = await this.prisma.church.findUnique({ where: { church_id: cemeteryId } });
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { Subscription_id: planId } });
    const flower = await this.prisma.flowers.findUnique({ where: { flower_id: flowerId } });

    if (!cemetery || !plan || !flower) {
      throw new NotFoundException('Invalid cemetery, plan, or flower selection.');
    }

    // Example cost logic
    const flowerCost = flower.Price;      // e.g., 500
    const planCost = plan.Price;          // e.g., 2000
    const cleaningCost = 100;             // e.g., flat per cleaning

    const cleanings = [firstCleaningDate, nextCleaningDate].filter(Boolean).length;
    const anniversaryCharge = anniversaryDate ? 300 : 0;
    const nameOnBouquetCharge = nameOnBouquet ? 50 : 0;

    const total = flowerCost + planCost + cleaningCost * cleanings + anniversaryCharge + nameOnBouquetCharge;

    return {
    message: 'Cost estimated successfully',
    data: {
        cemeteryName: cemetery.church_name,
        location: dto.city || dto.state,
        chosenPlan: plan.Subscription_name,
        flower: flower.Name,
        firstCleaningDate,
        nextCleaningDate,
        anniversaryDate,
        nameOnBouquet,
        totalCost: total,
    },
    status: HttpStatus.OK,
    };
  }
}
