import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.products.create({ data });
  }

  async findAll() {
    return this.prisma.products.findMany({ include: { Dimensions: true } });
  }

  async findOne(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { product_id: id },
      include: { Dimensions: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async delete(id: number) {
    return this.prisma.products.delete({ where: { product_id: id } });
  }
}
