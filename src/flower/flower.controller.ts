// flowers/flowers.controller.ts
import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FlowersService } from './flower.service';
import { CreateFlowerDto } from './dto/createflower.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateFlowerDto } from './dto/update-flower.dto';

@Controller('flowers')
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('add-flower')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateFlowerDto,
  ) {
    return this.flowersService.createFlower(dto, image);
  }

  @Get('get-all-flower')
  getAll() {
    return this.flowersService.getAllFlowers();
  }

  @Get(':id')
  async getFlowerById(@Param('id', ParseIntPipe) id: number) {
    return this.flowersService.getFlowerById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-flower-stock')
  updateStock(
    @Query('id', ParseIntPipe) flower_id: number,
    @Body('in_stock') is_stock: boolean,
    @Body('stock_count', ParseIntPipe) stock_count: number,
  ) {
    return this.flowersService.updateStock(flower_id, is_stock, stock_count);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  updateFlower(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlowerDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.flowersService.updateFlower(id, dto, image);
  }

  // DELETE /flowers/:id
  @Delete(':id')
  deleteFlower(@Param('id', ParseIntPipe) id: number) {
    return this.flowersService.deleteFlower(id);
  }
}
