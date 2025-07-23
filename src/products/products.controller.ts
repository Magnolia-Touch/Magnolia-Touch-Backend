import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('add-product')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('get-products')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('get-products/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Delete('delete-products:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
