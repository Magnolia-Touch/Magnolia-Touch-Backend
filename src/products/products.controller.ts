import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/product.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { UpdateProductDto } from './dto/productupdate.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('add-product')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('get-products')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('get-products-by')
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('delete-products-by')
  delete(@Query('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-product')
  updateProduct(
    @Body() dto: UpdateProductDto,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.updateProduct(id, dto);
  }
}
