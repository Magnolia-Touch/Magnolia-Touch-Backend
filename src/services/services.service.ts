import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    return await this.prisma.services.create({
      data: {
        name: dto.name,
        discription: dto.discription,
      },
    });
  }

  async findAll() {
    return await this.prisma.services.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.services.findUnique({
      where: { services_id: id },
    });
  }
}
