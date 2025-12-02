import {
  IsDate,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  Grave_id: number;

  @IsInt()
  Subscription_id: number;

  @IsDateString()
  date1: Date;

  @IsOptional()
  @IsDateString()
  date2?: Date;

  @IsInt()
  Flower_id: number;
}
