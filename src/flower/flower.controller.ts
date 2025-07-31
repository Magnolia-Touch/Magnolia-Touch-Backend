// flowers/flowers.controller.ts
import { Body, Controller, Get, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FlowersService } from './flower.service';
import { CreateFlowerDto } from './dto/createflower.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';

@Controller('flowers')
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('add-flower')
  create(@Body() dto: CreateFlowerDto) {
    return this.flowersService.createFlower(dto);
  }


  @Get('get-all-flower')
  getAll() {
    return this.flowersService.getAllFlowers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-flower-stock')
  updateStock(@Query('id', ParseIntPipe) flower_id: number, @Body('in_stock') is_stock: boolean) {
    return this.flowersService.updateStock(flower_id, is_stock);
  }

}
