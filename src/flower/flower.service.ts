import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlowerDto } from './dto/createflower.dto';

@Injectable()
export class FlowersService {
  constructor(private prisma: PrismaService) {}

  async createFlower(dto: CreateFlowerDto) {
    const flower = await this.prisma.flowers.create({
      data: {
        Name: dto.Name,
        Description: dto.Description,
        Price: dto.Price,
        in_stock: dto.in_stock,
      },
    });

    return {
      message: 'Flower added successfully',
      data: flower,
      status: HttpStatus.CREATED,
    };
  }

  async getAllFlowers() {
    const flowers = await this.prisma.flowers.findMany();

    return {
      message: 'All flowers fetched successfully',
      data: flowers,
      status: HttpStatus.OK,
    };
  }

  async updateStock(flower_id: number, is_stock: boolean) {
    const flower = await this.prisma.flowers.findUnique({ where: { flower_id } })
    if (!flower){
      throw new NotFoundException('Flower not found');
    }
    
    await this.prisma.flowers.update({
      where: { flower_id },
      data: { in_stock: is_stock }
    })
    return {
    message: 'Flower stock updated successfully',
    data: null,
    status: HttpStatus.OK,
    }
  }
}
