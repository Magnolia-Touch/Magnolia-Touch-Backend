import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  name_on_memorial: string;

  @IsString()
  plot_no: string;

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
// convert this to anniversary date
}
