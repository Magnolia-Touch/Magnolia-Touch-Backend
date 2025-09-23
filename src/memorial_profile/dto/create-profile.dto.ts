import { SocialNames } from '@prisma/client';
import {
    IsString,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsEnum,
    isString,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---- Nested DTOs ----
export class BiographyDto {
    @IsString()
    discription: string;
}

export class GalleryDto {
    @IsOptional()
    @IsString()
    link?: string;
}

export class FamilyDto {
    @IsString()
    relationship: string;

    @IsString()
    name: string;
}

export class SocialLinkDto {
    @IsOptional()
    @IsString()
    socialMediaName?: string;  // ⬅ changed from string to optional string

    @IsOptional()
    @IsString()
    link?: string;
}


export class GuestBookItemDto {
    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    photo_upload?: string;

    @IsString()
    date: string;

    @IsOptional()
    is_approved?: boolean;
}

export class EventDto {
    @IsString()
    year: string;

    @IsString()
    event: string;
}

// ---- Main DTO ----
export class CreateProfileDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    born_date: string;

    @IsString()
    death_date: string;

    @IsOptional()
    @IsString()
    memorial_place?: string;

    @IsOptional()
    @IsString()
    profile_image?: string;

    @IsOptional()
    @IsString()
    background_image?: string;

    @IsOptional()
    @IsBoolean()
    is_paid?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BiographyDto)
    biography?: BiographyDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GalleryDto)
    gallery?: GalleryDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FamilyDto)
    family?: FamilyDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GuestBookItemDto)
    guestBookItems?: GuestBookItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDto)
    socialLinks?: SocialLinkDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventDto)
    events?: EventDto[];
}
