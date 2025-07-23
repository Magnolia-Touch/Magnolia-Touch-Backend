import { Injectable, HttpStatus } from '@nestjs/common';
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
}
