import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChurchDto } from './dto/church-create.dto';

@Injectable()
export class ChurchService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChurchDto) {
    const church = await this.prisma.church.create({
      data: {
        church_name: dto.church_name,
        church_address: dto.church_address,
      },
    });

    return {
      message: 'Church created successfully',
      data: church,
      status: HttpStatus.CREATED,
    };
  }

  async findAll() {
    const churches = await this.prisma.church.findMany();
    return {
      message: 'All churches fetched successfully',
      data: churches,
      status: HttpStatus.OK,
    };
  }

  async findById(id: number) {
    const church = await this.prisma.church.findUnique({
      where: { church_id: id },
    });

    if (!church) {
      return {
        message: 'Church not found',
        data: null,
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      message: 'Church fetched successfully',
      data: church,
      status: HttpStatus.OK,
    };
  }
}
