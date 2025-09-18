import { IsInt, IsOptional, IsString, IsEnum, IsDecimal, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

class CreateOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsDecimal()
  price: number;

  @IsDecimal()
  total: number;
}

export class CreateOrderDto {
  @IsInt()
  User_id: number;

  @IsString()
  orderNumber: string;

  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsDecimal()
  totalAmount: number;

//   @IsOptional()
//   @IsDecimal()
//   shippingCost: number;

//   @IsOptional()
//   @IsDecimal()
//   taxAmount: number;

//   @IsOptional()
//   @IsDecimal()
//   discountAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsInt()
  shippingAddressId: number;

  @IsInt()
  billingAddressId: number;

  @IsOptional()
  @IsString()
  tracking_details?: string;

  @IsOptional()
  @IsInt()
  delivery_agent_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
