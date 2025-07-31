import { Controller, Post, HttpCode, HttpStatus, Headers, Req, Body, Query, Request } from '@nestjs/common';
import Stripe from 'stripe';
import * as dotenv from 'dotenv'
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-06-30.basil',
});

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; currency: string },@Query('productId') productId: number, @Request() req) {
    const { amount, currency } = body;
    const email = req.user.email
    return this.stripeService.createPaymentIntentforProduct(amount, currency, productId, email);
  }

  // @Post('webhook')
  // @HttpCode(HttpStatus.OK)
  // async handleWebhook(
  //   @Req() request: Request,
  //   @Headers('stripe-signature') sig: string,
  // ) {
  //   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  //   let event: Stripe.Event;

  //   try {
  //     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret!);
  //   } catch (err: any) {
  //     console.error('Webhook Error:', err.message);
  //     return { error: `Webhook Error: ${err.message}` };
  //   }

  //   // Process event
  //   switch (event.type) {
  //     case 'payment_intent.succeeded':
  //       const intent = event.data.object as Stripe.PaymentIntent;
  //       console.log('✅ Payment succeeded:', intent.id);
  //       break;

  //     case 'payment_intent.payment_failed':
  //       const failedIntent = event.data.object as Stripe.PaymentIntent;
  //       console.error('❌ Payment failed:', failedIntent.last_payment_error?.message);
  //       break;

  //     default:
  //       console.log(`Unhandled event type: ${event.type}`);
  //   }

  //   return { received: true };
  // }
}
