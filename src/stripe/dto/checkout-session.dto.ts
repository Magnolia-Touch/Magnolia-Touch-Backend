import { IsInt, IsOptional, IsString, ValidateIf, IsUrl } from "class-validator";

export class CheckoutSessionDto {
    @IsInt()
    shippingaddressId: number;

    @IsInt()
    billingaddressId: number;

    @IsString()
    currency: string;

    @IsUrl()
    successUrl: string;

    @IsUrl()
    cancelUrl: string;

    // Either cartId OR productId should be provided
    @IsOptional()
    @IsInt()
    cartId?: number;

    @ValidateIf(o => o.cartId === undefined) // Only validate if no cartId
    @IsInt()
    productId?: number;

    @ValidateIf(o => o.cartId === undefined) // Only validate if no cartId
    @IsOptional()
    @IsInt()
    quantity?: number;
}
