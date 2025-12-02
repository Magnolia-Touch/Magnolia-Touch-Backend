import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(dto: CreateServiceDto, image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    // Validate image type
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!this.s3Service.validateFileType(image, allowedImageTypes)) {
      throw new BadRequestException(
        'Invalid image type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!this.s3Service.validateFileSize(image, maxSize)) {
      throw new BadRequestException(
        'Image size too large. Maximum size is 5MB.',
      );
    }

    // Upload to S3
    const imageUrl = await this.s3Service.uploadFile(image, 'services');

    return await this.prisma.services.create({
      data: {
        name: dto.name,
        discription: dto.discription,
        features: dto.features,
        image: imageUrl,
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
