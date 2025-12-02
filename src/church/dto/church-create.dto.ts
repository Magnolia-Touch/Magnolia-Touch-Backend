import { IsString } from 'class-validator';

export class CreateChurchDto {
  @IsString()
  church_name: string;

  @IsString()
  church_address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;
}
