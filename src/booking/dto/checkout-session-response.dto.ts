import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CheckoutSessionLinkDto {
  @IsString()
  checkout_url: string;

  @IsString()
  session_id: string;

  @IsNumber()
  booking_id: number;

  @IsString()
  booking_ids: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  expires_at?: string;
}

export class BookingWithCheckoutDto {
  @IsNumber()
  id: number;

  @IsString()
  booking_ids: string;

  @IsString()
  name_on_memorial: string;

  @IsOptional()
  @IsString()
  plot_no?: string | null;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsBoolean()
  is_bought: boolean;

  @IsString()
  checkout_url: string;

  @IsString()
  session_id: string;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  expires_at?: string;
}

export class CreateBookingResponseDto {
  @IsString()
  message: string;

  booking: BookingWithCheckoutDto;

  @IsNumber()
  status: number;
}
