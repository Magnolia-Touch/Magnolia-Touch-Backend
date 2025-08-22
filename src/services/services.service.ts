import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { error } from 'console';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceDto, image: Express.Multer.File) {
    const imagePath = image.path;
    return await this.prisma.services.create({
      data: {
        name: dto.name,
        discription: dto.discription,
        features: dto.features,
        image: imagePath 
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
