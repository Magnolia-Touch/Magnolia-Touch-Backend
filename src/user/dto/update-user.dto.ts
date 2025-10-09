import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    customer_name?: string;

    @IsOptional()
    @IsString()
    Phone: string
}
