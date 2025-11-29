import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    Request,
    BadRequestException
} from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.sevice';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('gallery')
export class GalleryController {
    constructor(private galleryService: GalleryService,
        private readonly s3Service: S3Service,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post(':slug/gallery')
    @UseInterceptors(
        FilesInterceptor('media', 10) // no local diskStorage — S3 will be used
    )
    async uploadGallery(
        @Param('slug') slug: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req,
    ) {
        const email = req.user.email;

        if (!files || files.length === 0) {
            throw new BadRequestException('No media files uploaded');
        }

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
        const maxSize = 50 * 1024 * 1024; // 50MB per media

        const uploadedItems: { link: string }[] = [];

        for (const file of files) {
            const isImage = allowedImageTypes.includes(file.mimetype);
            const isVideo = allowedVideoTypes.includes(file.mimetype);

            if (!isImage && !isVideo) {
                throw new BadRequestException('Gallery files must be image or video');
            }

            if (!this.s3Service.validateFileSize(file, maxSize)) {
                throw new BadRequestException('One of the files is too large (max 50MB)');
            }

            const folder = isImage ? 'gallery-images' : 'gallery-videos';
            const url = await this.s3Service.uploadFile(file, folder);

            uploadedItems.push({ link: url });
        }

        // Save in DB
        return this.galleryService.addGalleryItems(slug, uploadedItems, email);
    }



    // GET ALL
    @Get(':slug')
    getAll(@Param('slug') slug: string) {
        return this.galleryService.getAll(slug);
    }

    // GET BY ID
    @Get(':slug/:id')
    getById(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.galleryService.getById(slug, id);
    }

    // UPDATE single gallery media
    @UseGuards(JwtAuthGuard)
    @Patch(':slug/:id')
    @UseInterceptors(FileInterceptor('media')) // "media" must match FE form key
    async updateGallery(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        const email = req.user.email;

        if (!file) {
            throw new BadRequestException('No media file uploaded');
        }

        // Allowed types
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        const isImage = allowedImageTypes.includes(file.mimetype);
        const isVideo = allowedVideoTypes.includes(file.mimetype);

        if (!isImage && !isVideo) {
            throw new BadRequestException('File must be an image or video');
        }

        if (!this.s3Service.validateFileSize(file, maxSize)) {
            throw new BadRequestException('File too large (max 50MB)');
        }

        const folder = isImage ? 'gallery-images' : 'gallery-videos';

        // Upload new file to S3
        const uploadedUrl = await this.s3Service.uploadFile(file, folder);

        // Update the DB record
        return this.galleryService.updateGalleryItem(slug, id, uploadedUrl, email);
    }



    // DELETE
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {

        const userId = req.user.customer_id
        return this.galleryService.deleteGalleryItem(id, userId);
    }

    // DELETE
    @UseGuards(JwtAuthGuard)
    @Delete('draft/:id')
    deletegallery(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {

        const userId = req.user.customer_id
        return this.galleryService.deleteGalleryDraftItem(id, userId);
    }
}
