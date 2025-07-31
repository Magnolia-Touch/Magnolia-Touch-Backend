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
    const flowerCost = parseInt(flower.Price, 10);  // '500' => 500
    const planCost = parseInt(plan.Price, 10);      // '2000' => 2000
           // e.g., flat per cleaning
    console.log('💐 Flower Price:', flower.Price, 'Type:', typeof flower.Price);
    console.log('📦 Plan Price:', plan.Price, 'Type:', typeof plan.Price);



    const nameOnBouquetCharge = nameOnBouquet ? 50 : 0;

    const total = flowerCost + planCost + nameOnBouquetCharge;

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
