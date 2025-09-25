// subscription/subscription.controller.ts
import { Body, Controller, Get, ParseIntPipe, Post, Patch, Delete, Query, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decoraters/roles.decorator';



@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: SubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  async findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(":id")
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOne(id);
  }

  // PATCH /subscription/:id
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<SubscriptionDto>,
  ) {
    return this.subscriptionService.updateSubscriptionPlan(id, dto);
  }

  // DELETE /subscription/:id
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.deleteSubscriptionPlan(id);
  }
}
