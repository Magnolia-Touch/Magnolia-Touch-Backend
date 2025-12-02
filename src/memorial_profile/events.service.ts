import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsDto } from './dto/childrens.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // CREATE
  async createEvent(slug: string, dto: EventsDto, email: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    return this.prisma.events.create({
      data: {
        ...dto,
        deadPersonProfiles: slug,
      },
    });
  }

  // GET ALL for a profile
  async getAllEvents(slug: string) {
    return this.prisma.events.findMany({
      where: { deadPersonProfiles: slug },
      orderBy: { year: 'asc' }, // Optional: makes timeline sorted
    });
  }

  // GET BY ID
  async getEventById(slug: string, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: {
        id: eventId,
        deadPersonProfiles: slug,
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    return event;
  }

  // UPDATE
  async updateEvent(
    slug: string,
    eventId: number,
    dto: Partial<EventsDto>,
    email: string,
  ) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    await this.getEventById(slug, eventId); // validate existence

    return this.prisma.events.update({
      where: { id: eventId },
      data: dto,
    });
  }

  // DELETE
  async deleteEvent(slug: string, eventId: number, email: string) {
    const profile = await this.prisma.deadPersonProfile.findUnique({
      where: { slug: slug, owner_id: email },
    });
    if (!profile) {
      throw new UnauthorizedException('Authorization Required');
    }
    await this.getEventById(slug, eventId);

    return this.prisma.events.delete({
      where: { id: eventId },
    });
  }
}
