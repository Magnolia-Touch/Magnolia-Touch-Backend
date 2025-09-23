import { Controller, Post, HttpCode, HttpStatus, Headers, Req, Body, Query, Request, ParseIntPipe } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutSessionDto } from './dto/checkout-session.dto';
import { ServiceBookingDto } from './dto/service-booking.dto';
import { ServiceCheckoutSessionDto } from './dto/service-checkout-session.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() checkoutdto: CheckoutDto,
    @Request() req,
  ) {
    const { email, id } = req.user;
    return this.stripeService.createPaymentIntentforQR(
      checkoutdto,
      email,
      id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-service-payment-intent')
  async createServicePaymentIntent(
    @Body() serviceBookingDto: ServiceBookingDto,
    @Request() req,
  ) {
    const { email } = req.user;
    const { amount, currency, booking_id } = serviceBookingDto;

    // Get booking details to generate booking_ids
    const booking = await this.prisma.booking.findUnique({
      where: { id: booking_id }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return this.stripeService.createPaymentIntentforService(
      amount,
      currency,
      booking.booking_ids,
      email,
      booking_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() checkoutSessionDto: CheckoutSessionDto,
    @Request() req,
  ) {
    const { email, id } = req.user;
    return this.stripeService.createCheckoutSessionforQr(
      checkoutSessionDto,
      email,
      id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-service-checkout-session')
  async createServiceCheckoutSession(
    @Body() serviceCheckoutSessionDto: ServiceCheckoutSessionDto,
    @Request() req,
  ) {
    const { email } = req.user;
    const { amount, currency, booking_id } = serviceCheckoutSessionDto;

    // Get booking details to generate booking_ids
    const booking = await this.prisma.booking.findUnique({
      where: { id: booking_id }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return this.stripeService.createCheckoutSessionforService(
      serviceCheckoutSessionDto,
      email,
      booking.booking_ids,
      booking_id,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() request: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(request.body, signature);
  }
}
