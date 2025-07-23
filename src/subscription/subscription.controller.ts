// subscription/subscription.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decoraters/roles.decorator';


// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post("add-subscription-plans")
  async create(@Body() dto: SubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get("get-subscription-plans")
  async findAll() {
    return this.subscriptionService.findAll();
  }
}
