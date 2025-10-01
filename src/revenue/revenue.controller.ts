// src/revenue/revenue.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';

@Controller('revenue')
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) { }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
    async getRevenue(
        @Query('filterType') filterType: 'month' | 'year' | 'range' | 'normal',
        @Query('service') service: 'cleaning' | 'memorial' | 'all' = 'all',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.revenueService.getRevenue(filterType, service, startDate, endDate);
    }
}
