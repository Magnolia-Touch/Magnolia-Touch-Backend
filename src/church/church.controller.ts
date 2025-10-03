// church/church.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/church-create.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { Roles } from 'src/common/decoraters/roles.decorator';


@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) { }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateChurchDto) {
    return this.churchService.create(dto);
  }

  @Get()
  findAll() {
    return this.churchService.findAll();
  }


  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.churchService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateChurchDto) {
    return this.churchService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.churchService.delete(id);
  }

}
