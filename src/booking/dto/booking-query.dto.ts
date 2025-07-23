import { IsInt, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingQueryDto {
  @IsInt()
  @Type(() => Number)
  church_id: number;

  @IsInt()
  @Type(() => Number)
  subscription_id: number;

  @IsInt()
  @Type(() => Number)
  flower_id: number;
}
