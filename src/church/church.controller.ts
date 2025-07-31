// church/church.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/church-create.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';


@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('add-church')
  create(@Body() dto: CreateChurchDto) {
    return this.churchService.create(dto);
  }

  @Get('get-church')
  findAll() {
    return this.churchService.findAll();
  }

  
  @Get('get-church-by')
  findById(@Query('id', ParseIntPipe) id: number) {
    return this.churchService.findById(id);
  }

}
