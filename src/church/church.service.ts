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
    console.log(`Fetching church with ID: ${id}`);
    const church = await this.prisma.church.findUnique({
      where: { church_id: id },
    });

    if (!church) {
      throw new NotFoundException('Church not found');
    }

    return {
      message: 'Church fetched successfully',
      data: church,
      status: HttpStatus.OK,
    };
  }
}
