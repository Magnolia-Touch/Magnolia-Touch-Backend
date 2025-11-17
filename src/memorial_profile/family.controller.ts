import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    Request
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyDto } from './dto/childrens.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('family')
export class FamilyController {
    constructor(private familyService: FamilyService) { }

    // CREATE  
    @UseGuards(JwtAuthGuard)
    @Post(':slug')
    createFamily(
        @Param('slug') slug: string,
        @Body() dto: FamilyDto,
        @Request() req,
    ) {
        const email = req.user.email
        return this.familyService.createFamily(slug, dto, email);
    }

    // GET ALL
    @Get(':slug')
    getAll(@Param('slug') slug: string) {
        return this.familyService.getAllFamilies(slug);
    }

    // GET BY ID
    @Get(':slug/:familyId')
    getById(
        @Param('slug') slug: string,
        @Param('familyId', ParseIntPipe) familyId: number,
    ) {
        return this.familyService.getFamilyById(slug, familyId);
    }

    // UPDATE
    @UseGuards(JwtAuthGuard)
    @Patch(':slug/:familyId')
    updateFamily(
        @Param('slug') slug: string,
        @Param('familyId', ParseIntPipe) familyId: number,
        @Body() dto: Partial<FamilyDto>,
        @Request() req,
    ) {
        const email = req.user.email
        return this.familyService.updateFamily(slug, familyId, dto, email);
    }

    // DELETE
    @UseGuards(JwtAuthGuard)
    @Delete(':slug/:familyId')
    deleteFamily(
        @Param('slug') slug: string,
        @Param('familyId', ParseIntPipe) familyId: number,
        @Request() req,
    ) {
        const email = req.user.email
        return this.familyService.deleteFamily(slug, familyId, email);
    }
}
