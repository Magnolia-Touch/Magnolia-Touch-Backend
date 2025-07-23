// dto/create-flower.dto.ts
import { IsBoolean, IsString } from 'class-validator';

export class CreateFlowerDto {
  @IsString()
  Name: string;

  @IsString()
  Description: string;

  @IsString()
  Price: string;

  @IsBoolean()
  in_stock: boolean;
}
