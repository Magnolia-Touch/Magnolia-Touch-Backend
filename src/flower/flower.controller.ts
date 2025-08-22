// flowers/flowers.controller.ts
import { Body, Controller, Get, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FlowersService } from './flower.service';
import { CreateFlowerDto } from './dto/createflower.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';



@Controller('flowers')
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('add-flower')
  @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage({
          destination: './uploads/flowers',
          filename: (req, file, cb) => {
            const uniqueName =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueName}${extname(file.originalname)}`);
          },
        }),
      }),
    )
  create(@UploadedFile() image: Express.Multer.File,@Body() dto: CreateFlowerDto) {
    return this.flowersService.createFlower(dto, image);
  }


  @Get('get-all-flower')
  getAll() {
    return this.flowersService.getAllFlowers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-flower-stock')
  updateStock(@Query('id', ParseIntPipe) flower_id: number, @Body('in_stock') is_stock: boolean) {
    return this.flowersService.updateStock(flower_id, is_stock);
  }

}
