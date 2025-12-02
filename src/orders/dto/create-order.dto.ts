import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsDecimal,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsInt()
  User_id: number;

  @IsString()
  orderNumber: string;

  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsDecimal()
  totalAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  shippingAddressId?: number; // ✅ fixed name

  @IsInt()
  billingAddressId: number; // ✅ required, fixed name

  @IsOptional()
  @IsInt()
  church_id?: number;

  @IsOptional()
  @IsString()
  tracking_details?: string;

  @IsString()
  memoryProfileId: string;

  @IsOptional()
  @IsInt()
  delivery_agent_id?: number;
}
