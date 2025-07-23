// flowers/flowers.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { FlowersService } from './flower.service';
import { CreateFlowerDto } from './dto/createflower.dto';

@Controller('flowers')
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @Post('add-flower')
  create(@Body() dto: CreateFlowerDto) {
    return this.flowersService.createFlower(dto);
  }

  @Get('get-all-flower')
  getAll() {
    return this.flowersService.getAllFlowers();
  }

}
