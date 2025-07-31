import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post('create-service')
  async create(@Body() dto: CreateServiceDto) {
    return await this.servicesService.create(dto);
  }

  @Get('list-services')
  async findAll() {
    return await this.servicesService.findAll();
  }

  @Get('list-services/:id')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    return await this.servicesService.findOne(id);
  }
}
