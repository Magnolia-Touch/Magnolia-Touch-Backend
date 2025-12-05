import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocialLinksDto } from './dto/childrens.dto';

@Injectable()
export class SocialLinksService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async createSocialLink(slug: string, dto: SocialLinksDto, email: string) {
    // If biography already exists → delete it (or you can choose update)
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    return this.prisma.socialLinks.create({
      data: {
        ...dto,
        deadPersonProfiles: slug,
      },
    });
  }

  // GET ALL for a profile
  async getAllSocialLinks(slug: string) {
    return this.prisma.socialLinks.findMany({
      where: { deadPersonProfiles: slug },
    });
  }

  // GET BY ID
  async getSocialLinkById(slug: string, id: number) {
    const link = await this.prisma.socialLinks.findFirst({
      where: { id, deadPersonProfiles: slug },
    });

    if (!link) throw new NotFoundException('Social link not found');

    return link;
  }

  // UPDATE
  async updateSocialLink(
    slug: string,
    id: number,
    dto: Partial<SocialLinksDto>,
    email: string,
  ) {
    // If biography already exists → delete it (or you can choose update)
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    await this.getSocialLinkById(slug, id); // Validate

    return this.prisma.socialLinks.update({
      where: { id },
      data: dto,
    });
  }

  // DELETE
  async deleteSocialLink(slug: string, id: number, email: string) {
    // If biography already exists → delete it (or you can choose update)
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    await this.getSocialLinkById(slug, id);

    return this.prisma.socialLinks.delete({
      where: { id },
    });
  }
}
