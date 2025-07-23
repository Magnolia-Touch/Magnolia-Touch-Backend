import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateUserAddressDto {
  @IsString()
  Name: string;

  @IsString()
  street: string;

  @IsString()
  town_or_city: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  postcode: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsInt()
  userCustomer_id?: number;
}
