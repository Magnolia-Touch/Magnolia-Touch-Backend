import { IsString } from 'class-validator';

export class CreateChurchDto {
  @IsString()
  church_name: string;

  @IsString()
  church_address: string;
}
