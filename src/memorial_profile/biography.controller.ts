import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request
} from '@nestjs/common';
import { BiographyService } from './biography.service';
import { BiographyDto } from './dto/childrens.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('biography')
export class BiographyController {
    constructor(private biographyService: BiographyService) { }

    // CREATE or REPLACE
    @UseGuards(JwtAuthGuard)
    @Post(':slug')
    createOrReplace(
        @Param('slug') slug: string,
        @Body() dto: BiographyDto,
        @Request() req,
    ) {
        const email = req.user.email
        return this.biographyService.createOrReplaceBiography(slug, dto, email);
    }

    // GET biography
    @Get(':slug')
    getBiography(@Param('slug') slug: string,
        @Request() req,) {
        return this.biographyService.getBiography(slug);
    }

    // UPDATE biography (partial allowed)
    @UseGuards(JwtAuthGuard)
    @Patch(':slug')
    updateBiography(
        @Param('slug') slug: string,
        @Body() dto: Partial<BiographyDto>,
        @Request() req,
    ) {
        const email = req.user.email
        return this.biographyService.updateBiography(slug, dto, email);
    }

    // DELETE biography
    @UseGuards(JwtAuthGuard)
    @Delete(':slug')
    deleteBiography(@Param('slug') slug: string,
        @Request() req,) {
        const email = req.user.email
        return this.biographyService.deleteBiography(slug, email);
    }
}
