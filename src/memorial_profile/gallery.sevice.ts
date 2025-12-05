import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async addGalleryItems(
    slug: string,
    galleryItems: { link: string }[],
    email: string,
  ) {
    if (!galleryItems || galleryItems.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Ensure user owns this profile
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug, owner_id: email },
    });

    if (!profile) {
      throw new NotFoundException('Authorization Required');
    }

    // Prepare DB insert data
    const data = galleryItems.map((item) => ({
      deadPersonProfiles: slug,
      link: item.link,
    }));

    // Save multiple entries
    await this.prisma.gallery.createMany({
      data,
    });

    return {
      message: `${galleryItems.length} gallery items uploaded successfully`,
      files: data,
    };
  }

  // GET all gallery items for a profile
  async getAll(slug: string) {
    return this.prisma.gallery.findMany({
      where: { deadPersonProfiles: slug },
    });
  }

  // GET gallery item by ID
  async getById(slug: string, id: number) {
    const item = await this.prisma.gallery.findFirst({
      where: { gallery_id: id, deadPersonProfiles: slug },
    });

    if (!item) throw new NotFoundException('Gallery item not found');

    return item;
  }

  async updateGalleryItem(
    slug: string,
    galleryId: number,
    uploadedUrl: string,
    email: string,
  ) {
    // Confirm profile belongs to user
    const profile = await this.prisma.deadPersonProfile.findFirst({
      where: { slug, owner_id: email },
    });

    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }

    // Confirm gallery item exists
    const existing = await this.prisma.gallery.findFirst({
      where: { gallery_id: galleryId, deadPersonProfiles: profile.slug },
    });

    if (!existing) {
      throw new NotFoundException('Gallery item not found');
    }

    // Update DB
    return this.prisma.gallery.update({
      where: { gallery_id: galleryId },
      data: {
        link: uploadedUrl,
      },
    });
  }

  // DELETE gallery item
  async deleteGalleryItem(id: number, userId: number) {
    return this.prisma.gallery.delete({
      where: { gallery_id: id, profile: { user: { customer_id: userId } } },
    });
  }

  // DELETE gallery item
  async deleteGalleryDraftItem(id: number, userId: number) {
    return this.prisma.galleryDraft.delete({
      where: { gallery_id: id, profile: { user: { customer_id: userId } } },
    });
  }
}
