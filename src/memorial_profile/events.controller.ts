import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsDto } from './dto/childrens.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // CREATE
  @UseGuards(JwtAuthGuard)
  @Post(':slug')
  createEvent(
    @Param('slug') slug: string,
    @Body() dto: EventsDto,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.eventsService.createEvent(slug, dto, email);
  }

  // GET ALL
  @Get(':slug')
  getAll(@Param('slug') slug: string) {
    return this.eventsService.getAllEvents(slug);
  }

  // GET BY ID
  @Get(':slug/:eventId')
  getById(
    @Param('slug') slug: string,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.eventsService.getEventById(slug, eventId);
  }

  // UPDATE
  @UseGuards(JwtAuthGuard)
  @Patch(':slug/:eventId')
  updateEvent(
    @Param('slug') slug: string,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: Partial<EventsDto>,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.eventsService.updateEvent(slug, eventId, dto, email);
  }

  // DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':slug/:eventId')
  deleteEvent(
    @Param('slug') slug: string,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.eventsService.deleteEvent(slug, eventId, email);
  }
}
