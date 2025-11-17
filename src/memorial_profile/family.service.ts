import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FamilyDto } from './dto/childrens.dto';

@Injectable()
export class FamilyService {
    constructor(private prisma: PrismaService) { }

    // CREATE
    async createFamily(slug: string, dto: FamilyDto, email: string) {
        // If biography already exists → delete it (or you can choose update)
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }
        return this.prisma.family.create({
            data: {
                ...dto,
                deadPersonProfiles: slug,
            },
        });
    }

    // GET ALL for a profile
    async getAllFamilies(slug: string) {
        return this.prisma.family.findMany({
            where: { deadPersonProfiles: slug },
        });
    }

    // GET BY ID
    async getFamilyById(slug: string, familyId: number) {
        const family = await this.prisma.family.findFirst({
            where: {
                family_id: familyId,
                deadPersonProfiles: slug,
            },
        });

        if (!family) throw new NotFoundException('Family not found');
        return family;
    }

    // UPDATE
    async updateFamily(slug: string, familyId: number, dto: Partial<FamilyDto>, email: string) {
        // If biography already exists → delete it (or you can choose update)
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }
        await this.getFamilyById(slug, familyId); // check existence

        return this.prisma.family.update({
            where: { family_id: familyId },
            data: dto,
        });
    }

    // DELETE
    async deleteFamily(slug: string, familyId: number, email: string) {
        // If biography already exists → delete it (or you can choose update)
        const profile = await this.prisma.deadPersonProfile.findUnique({
            where: { slug: slug, owner_id: email }
        })
        if (!profile) {
            throw new UnauthorizedException("Authorization Required")
        }
        await this.getFamilyById(slug, familyId);

        return this.prisma.family.delete({
            where: { family_id: familyId },
        });
    }
}
