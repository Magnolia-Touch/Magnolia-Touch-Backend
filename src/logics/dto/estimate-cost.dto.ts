import { IsOptional, IsString, IsDateString } from 'class-validator';

export class EstimateCostDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsDateString()
  firstCleaningDate: string;

  @IsDateString()
  nextCleaningDate: string;

  @IsDateString()
  anniversaryDate: string;

  @IsString()
  nameOnBouquet: string;
}
