// order.controller.ts
import { Controller, Get, Query, Body } from '@nestjs/common';
import { EstimateCostDto } from './dto/estimate-cost.dto';
import { LogicService } from './logics.service';

@Controller('estimate')
export class LogicController {
  constructor(private readonly logicService: LogicService) { }

  @Get('estimate-cost')
  async estimateCost(
    @Body() dto: EstimateCostDto,
  ) {
    return await this.logicService.estimateCost(dto);
  }
}
