import { IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  link: string;
  
}
