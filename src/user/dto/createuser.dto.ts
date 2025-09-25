import { IsString, IsEmail, IsPhoneNumber, MinLength, IsOptional, IsEnum } from "class-validator"
import { Role } from "@prisma/client"

export class CreateUserDto {
    @IsString()
    customer_name: string

    @IsEmail()
    email: string

    @IsString()
    Phone: string

    @IsString()
    @MinLength(6)
    password: string

    @IsOptional()
    @IsEnum(Role)
    role?: Role
}

