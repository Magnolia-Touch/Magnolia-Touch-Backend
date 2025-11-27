import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BiographyDto } from './dto/childrens.dto';

@Injectable()
export class BiographyService {
    constructor(private prisma: PrismaService) { }

    // CREATE or REPLACE
    async createOrReplaceBiography(slug: string, dto: BiographyDto, email: string) {
        // If biography already exists → delete it (or you can choose update)
        console.log(email, slug)
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        console.log(profile)
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }
        const existing = await this.prisma.biography.findUnique({
            where: { deadPersonProfiles: slug },
        });

        if (existing) {
            await this.prisma.biography.delete({
                where: { biography_id: existing.biography_id },
            });
        }

        return this.prisma.biography.create({
            data: {
                ...dto,
                deadPersonProfiles: slug,
            },
        });
    }

    // GET biography for a profile
    async getBiography(slug: string) {
        const bio = await this.prisma.biography.findUnique({
            where: { deadPersonProfiles: slug },
        });

        if (!bio) throw new NotFoundException('Biography not found');

        return bio;
    }

    // UPDATE biography
    async updateBiography(slug: string, dto: Partial<BiographyDto>, email: string) {
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }
        const bio = await this.prisma.biography.findUnique({
            where: { deadPersonProfiles: slug },
        });

        if (!bio) throw new NotFoundException('Biography not found');

        return this.prisma.biography.update({
            where: { biography_id: bio.biography_id },
            data: dto,
        });
    }

    // DELETE biography
    async deleteBiography(slug: string, email: string) {
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }

        const bio = await this.prisma.biography.findUnique({
            where: { deadPersonProfiles: slug },
        });

        if (!bio) throw new NotFoundException('Biography not found');

        return this.prisma.biography.delete({
            where: { biography_id: bio.biography_id },
        });
    }
}
