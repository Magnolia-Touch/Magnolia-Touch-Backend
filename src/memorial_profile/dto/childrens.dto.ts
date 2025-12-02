import { IsString } from 'class-validator';

export class FamilyDto {
  @IsString()
  relationship: string;

  @IsString()
  name: string;
}

export class EventsDto {
  @IsString()
  year: string;

  @IsString()
  event: string;
}

export class SocialLinksDto {
  @IsString()
  socialMediaName: string;

  @IsString()
  link: string;
}

export class BiographyDto {
  @IsString()
  description: string;
}
