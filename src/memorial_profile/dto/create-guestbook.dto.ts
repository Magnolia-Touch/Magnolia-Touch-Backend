import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateGuestBookDto {
  @IsString()
  first_name: string;
  @IsString()
  last_name: string;
  @IsOptional()
  @IsString()
  guestemail: string;
  @IsOptional()
  @IsString()
  phone: string;
  @IsString()
  message: string;
}
