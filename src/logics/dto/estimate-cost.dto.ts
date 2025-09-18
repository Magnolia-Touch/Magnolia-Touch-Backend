import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class EstimateCostDto {
  @IsString()
  church_name: string;

  @IsString()
  plot_no: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsInt()
  @Type(() => Number)
  subscription_id: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  flower_id?: number;

  @IsString()
  first_cleaning_date: Date;

  @IsOptional()
  @IsString()
  second_cleaning_date?: Date;

  @IsOptional()
  @IsString()
  anniversary_date?: Date;

  @IsOptional()
  @IsInt()
  no_of_subsribe_years?: number;
}
