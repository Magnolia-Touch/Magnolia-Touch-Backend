// church/church.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/church-create.dto';

@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post('add-church')
  create(@Body() dto: CreateChurchDto) {
    return this.churchService.create(dto);
  }

  @Get('get-church')
  findAll() {
    return this.churchService.findAll();
  }

  @Get('get-church/:id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.churchService.findById(id);
  }

}
