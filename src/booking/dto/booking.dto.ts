import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  name_on_memorial: string;

  @IsString()
  plot_no: string;

  @IsString()
  date1: Date;

  @IsOptional()
  @IsString()
  date2?: Date;

  @IsOptional()
  @IsString()
  next_cleaning_date?: Date;
// convert this to anniversary date
}
