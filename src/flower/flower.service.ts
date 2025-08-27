import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateFlowerDto } from './dto/createflower.dto';

@Injectable()
export class FlowersService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
  ) { }

  async createFlower(dto: CreateFlowerDto, image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    // Validate image type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!this.s3Service.validateFileType(image, allowedImageTypes)) {
      throw new BadRequestException('Invalid image type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!this.s3Service.validateFileSize(image, maxSize)) {
      throw new BadRequestException('Image size too large. Maximum size is 5MB.');
    }

    // Upload to S3
    const imageUrl = await this.s3Service.uploadFile(image, 'flowers');

    const flower = await this.prisma.flowers.create({
      data: {
        image: imageUrl,
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
    if (!flower) {
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
