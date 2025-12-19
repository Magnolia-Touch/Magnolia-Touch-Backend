import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CleaningStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  name_on_memorial: string;

  @IsString()
  church_name: string;

  @IsString()
  notes: string;

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

  @IsOptional()
  @IsEnum(CleaningStatus)
  status?: CleaningStatus;
}
