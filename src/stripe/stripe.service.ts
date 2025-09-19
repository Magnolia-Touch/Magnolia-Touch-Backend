import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  generateOrderIdforProduct,
  generateOrderIdforService,
} from 'src/utils/code-generator.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutSessionDto } from './dto/checkout-session.dto';
import { ServiceCheckoutSessionDto } from './dto/service-checkout-session.dto';
import { WebhookService } from './webhook.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderservice: OrdersService,
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createPaymentIntentforQR(
    checkoutdto: CheckoutDto,
    user_email: string,
    user_id: number,
  ): Promise<Stripe.PaymentIntent> {
    let subtotal = 0;
    let product: any | null = null;
    const {
      shippingaddressId,
      billingaddressId,
      currency,
      church_id,
      memoryProfileId,
    } = checkoutdto;

    let shippingAddress: any | null = null;
    let billingAddress: any | null = null;
    let church: any | null = null;
    if (shippingaddressId) {
      shippingAddress = await this.prisma.userAddress.findUnique({ where: { deli_address_id: shippingaddressId } })
    }
    else if (billingaddressId) {
      billingAddress = await this.prisma.billingAddress.findUnique({ where: { bill_address_id: billingaddressId } })
    }
    else if (church_id) {
      church = await this.prisma.church.findUnique({ where: { church_id: church_id } })
    }
    try {
      //hardcode for demo
      subtotal = product ? Number(product.price) : 100; // fallback ₹100 / $1.00

      // 1️⃣ Create Order in DB
      const order = await this.orderservice.create({
        User_id: user_id,
        orderNumber: generateOrderIdforProduct(),
        status: 'pending',
        totalAmount: subtotal,
        shippingAddressId: shippingaddressId ?? null,
        billingAddressId: billingaddressId,
        church_id: church_id ?? null,
        memoryProfileId: memoryProfileId ?? 'none',
        tracking_details: undefined,
        delivery_agent_id: undefined,
      });

      // 2️⃣ Ensure subtotal > 0
      if (subtotal <= 0) {
        throw new Error('Subtotal must be greater than 0 to create a payment intent');
      }

      // 3️⃣ Create PaymentIntent in Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(subtotal * 100), // Stripe expects cents/paise
        currency,
        metadata: {
          order_id: String(order.id),
          orderNumber: order.orderNumber,
          user_email,
          memoryProfile: `http://localhost:3000/memories?code=${memoryProfileId}`,
          shippingaddress: shippingAddress,
          BillingAddress: billingAddress,
          church: church,
        },
      });

      this.logger.log(
        `PaymentIntent created successfully with amount: ${subtotal} ${currency}`,
      );

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw error;
    }
  }

  async createPaymentIntentforService(
    amount: number,
    currency: string,
    booking_ids: string, // booking_ids from database
    user_email: string,
    booking_id?: number, // optional database ID for webhook processing
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: {
          service_id: booking_ids,
          ...(booking_id ? { booking_id: String(booking_id) } : {}), // ✅ fixed
          booking_ids,
          order_id: generateOrderIdforService(),
          description: 'Payment for Memorial Cleaning Service',
          user_email,
        },
      });
      this.logger.log(
        `PaymentIntent created successfully for booking ${booking_ids} with amount: ${amount} ${currency}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        'Failed to create PaymentIntent for service',
        error.stack,
      );
      throw error;
    }
  }

  async createCheckoutSessionforQr(
    checkoutSessionDto: CheckoutSessionDto,
    user_email: string,
    user_id: number,

  ): Promise<Stripe.Checkout.Session> {
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;
    const { shippingaddressId, billingaddressId, currency, church_id, memoryProfileId, successUrl, cancelUrl } = checkoutSessionDto;

    let shippingAddress: any | null = null;
    let billingAddress: any | null = null;
    let church: any | null = null;
    if (shippingaddressId) {
      shippingAddress = await this.prisma.userAddress.findUnique({ where: { deli_address_id: shippingaddressId } })
    }
    else if (billingaddressId) {
      billingAddress = await this.prisma.billingAddress.findUnique({ where: { bill_address_id: billingaddressId } })
    }
    else if (church_id) {
      church = await this.prisma.church.findUnique({ where: { church_id: church_id } })
    }

    try {
      // 1️⃣ Create Order in DB (with pending status)
      const order = await this.orderservice.create({
        User_id: user_id,
        orderNumber: generateOrderIdforProduct(),
        status: 'pending',
        totalAmount: subtotal,
        shippingAddressId: shippingaddressId ?? null,
        billingAddressId: billingaddressId,
        church_id: church_id ?? null,
        memoryProfileId: memoryProfileId ?? 'none',
        tracking_details: undefined,
        delivery_agent_id: undefined,
      });

      // 2️⃣ Create Checkout Session in Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
        customer_email: user_email,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB'], // Configure based on your shipping zones
        },
        billing_address_collection: 'required',
        metadata: {
          order_id: String(order.id),
          orderNumber: order.orderNumber,
          user_email,
          memoryProfile: `http://localhost:3000/memories?code=${memoryProfileId}`,
          shippingaddress: shippingAddress,
          BillingAddress: billingAddress,
          church: church,
        },
      });

      this.logger.log(
        `Checkout Session created successfully with amount: ${subtotal} ${currency}`,
      );
      return session;
    } catch (error) {
      this.logger.error('Failed to create Checkout Session', error.stack);
      throw error;
    }
  }

  async createCheckoutSessionforService(
    serviceCheckoutSessionDto: ServiceCheckoutSessionDto,
    user_email: string,
    booking_ids: string,
    booking_id?: number,
  ): Promise<Stripe.Checkout.Session> {
    const { amount, currency, successUrl, cancelUrl } = serviceCheckoutSessionDto;

    try {
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Memorial Cleaning Service',
            description: 'Professional memorial cleaning service',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }];

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&booking_id=' + booking_id,
        cancel_url: cancelUrl + '?booking_id=' + booking_id,
        customer_email: user_email,
        metadata: {
          service_id: booking_ids,
          ...(booking_id ? { booking_id: String(booking_id) } : {}),
          booking_ids,
          order_id: generateOrderIdforService(),
          description: 'Payment for Memorial Cleaning Service',
          user_email,
        },
      });

      this.logger.log(
        `Checkout Session created successfully for booking ${booking_ids} with amount: ${amount} ${currency}`,
      );
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create Checkout Session for service',
        error.stack,
      );
      throw error;
    }
  }

  async getCheckoutSessionById(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error(`Failed to retrieve checkout session ${sessionId}:`, error.stack);
      return null;
    }
  }

  async createCheckoutLinkForExistingBooking(
    booking: any,
    user_email: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Memorial Cleaning Service',
            description: `Cleaning service for ${booking.name_on_memorial} at ${booking.plot_no}`,
          },
          unit_amount: Math.round(booking.amount * 100),
        },
        quantity: 1,
      }];

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&booking_id=' + booking.id,
        cancel_url: cancelUrl + '?booking_id=' + booking.id,
        customer_email: user_email,
        metadata: {
          service_id: booking.booking_ids,
          booking_id: String(booking.id),
          booking_ids: booking.booking_ids,
          order_id: generateOrderIdforService(),
          description: 'Payment for Memorial Cleaning Service',
          user_email,
        },
      });

      this.logger.log(
        `Checkout Session created for existing booking ${booking.booking_ids} with amount: ${booking.amount} USD`,
      );
      return session;
    } catch (error) {
      this.logger.error(
        'Failed to create Checkout Session for existing booking',
        error.stack,
      );
      throw error;
    }
  }

  async handleWebhook(body: Buffer, signature: string) {
    const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    if (!endpointSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not configured');
      throw new Error('Webhook endpoint secret not configured');
    }

    try {
      const event = this.webhookService.verifyWebhookSignature(
        body,
        signature,
        endpointSecret,
      );

      const result = await this.webhookService.processWebhookEvent(event);

      await this.webhookService.logWebhookEvent(event, result);

      if (result.success) {
        this.logger.log(`Webhook processed successfully: ${result.message}`);
        return { received: true, message: result.message };
      } else {
        this.logger.error(`Webhook processing failed: ${result.message}`);
        return {
          received: false,
          error: result.error || result.message,
        };
      }
    } catch (error) {
      this.logger.error('Webhook handler error:', error.stack);
      throw error;
    }
  }
}
