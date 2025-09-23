// dto/create-flower.dto.ts
import { IsBoolean, IsInt, IsString, } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFlowerDto {
  @IsString()
  Name: string;

  @IsString()
  Description: string;

  @IsString()
  Price: string;

  @IsInt()
  stock_count: number;

  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'yes'].includes(value.toLowerCase());
    }
    return false;
  })
  @IsBoolean()
  in_stock: boolean;
}
