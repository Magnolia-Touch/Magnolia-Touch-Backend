import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  product_name: string;

  @IsOptional()
  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  box_contains?: string;

  @IsOptional()
  @IsString()
  short_Description: string;

  @IsOptional()
  @IsString()
  detailed_description?: string;

  @IsOptional()
  @IsString()
  company_guarantee?: string;

}
