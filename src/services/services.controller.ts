import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Roles } from 'src/common/decoraters/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create-service')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateServiceDto,
  ) {
    return await this.servicesService.create(dto, image);
  }

  @Get('list-services')
  async findAll() {
    return await this.servicesService.findAll();
  }

  @Get('list-services-by-id/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.servicesService.findOne(id);
  }
}
