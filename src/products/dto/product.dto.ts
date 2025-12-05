import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  product_name: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  box_contains?: string;

  @IsString()
  short_Description: string;

  @IsOptional()
  @IsString()
  detailed_description?: string;

  @IsOptional()
  @IsString()
  company_guarantee?: string;
}
