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
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
    private prisma: PrismaService,
    private orderservice: OrdersService,
    private configService: ConfigService,
    private webhookService: WebhookService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createPaymentIntentforProduct(
    checkoutdto: CheckoutDto,
    user_email: string,
    user_id: number,
    product_id?: number,
    quantity?: number,
    cartId?: number,
  ): Promise<Stripe.PaymentIntent> {
    let items: {
      productId: number;
      quantity: number;
      price: number;
      total: number;
    }[] = [];

    let subtotal = 0;
    let product: any | null = null;
    const { shippingaddressId, billingaddressId, currency } = checkoutdto;
    try {
      // Case 1: Checkout from Cart
      if (cartId) {
        const cartItems = await this.prisma.cartItem.findMany({
          where: { cartId },
          include: { product: true },
        });

        if (!cartItems.length) throw new Error('Cart is empty');

        items = cartItems.map((ci) => ({
          productId: ci.productId,
          quantity: ci.quantity,
          price: Number(ci.product.price),
          total: ci.quantity * Number(ci.product.price),
        }));
        subtotal = items.reduce((acc, i) => acc + i.total, 0);
      }
      // Case 2: Single Product Checkout
      else if (product_id) {
        product = await this.prisma.products.findUnique({
          where: { product_id },
        });

        if (!product)
          throw new Error(`Product with ID ${product_id} not found`);

        items = [
          {
            productId: product.product_id,
            quantity: quantity ?? 1,
            price: Number(product.price),
            total: (quantity ?? 1) * Number(product.price),
          },
        ];

        subtotal = items[0].total;
      }

      // 1️⃣ Create Order in DB
      const order = await this.orderservice.create({
        User_id: user_id,
        orderNumber: generateOrderIdforProduct(),
        status: 'pending',
        totalAmount: subtotal,
        shippingAddressId: shippingaddressId,
        billingAddressId: billingaddressId,
        tracking_details: undefined,
        delivery_agent_id: undefined,
        items,
      });

      // 2️⃣ Create PaymentIntent in Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(subtotal * 100),
        currency,
        metadata: {
          order_id: String(order.id),
          orderNumber: order.orderNumber,
          user_email,
          ...(product
            ? {
                product_id: String(product.product_id),
                product_name: product.product_name,
                price: String(product.price),
                box_contains: product.box_contains,
                short_Description: product.short_Description?.slice(0, 200),
              }
            : { cartId: String(cartId) }),
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

  async createCheckoutSessionforProduct(
    checkoutSessionDto: CheckoutSessionDto,
    user_email: string,
    user_id: number,
    product_id?: number,
    quantity?: number,
    cartId?: number,
  ): Promise<Stripe.Checkout.Session> {
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;
    let product: any | null = null;
    const { shippingaddressId, billingaddressId, currency, successUrl, cancelUrl } = checkoutSessionDto;
    
    try {
      // Case 1: Checkout from Cart
      if (cartId) {
        const cartItems = await this.prisma.cartItem.findMany({
          where: { cartId },
          include: { product: true },
        });

        if (!cartItems.length) throw new Error('Cart is empty');

        line_items = cartItems.map((ci) => ({
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: ci.product.product_name,
              description: ci.product.short_Description?.slice(0, 300) || undefined,
              images: undefined, // Product image field needs to be checked in your database schema
            },
            unit_amount: Math.round(Number(ci.product.price) * 100),
          },
          quantity: ci.quantity,
        }));
        
        subtotal = cartItems.reduce((acc, ci) => acc + (ci.quantity * Number(ci.product.price)), 0);
      }
      // Case 2: Single Product Checkout
      else if (product_id) {
        product = await this.prisma.products.findUnique({
          where: { product_id },
        });

        if (!product)
          throw new Error(`Product with ID ${product_id} not found`);

        line_items = [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: product.product_name,
              description: product.short_Description?.slice(0, 300) || undefined,
              images: undefined, // Product image field needs to be checked in your database schema
            },
            unit_amount: Math.round(Number(product.price) * 100),
          },
          quantity: quantity ?? 1,
        }];

        subtotal = (quantity ?? 1) * Number(product.price);
      }

      // 1️⃣ Create Order in DB (with pending status)
      const order = await this.orderservice.create({
        User_id: user_id,
        orderNumber: generateOrderIdforProduct(),
        status: 'pending',
        totalAmount: subtotal,
        shippingAddressId: shippingaddressId,
        billingAddressId: billingaddressId,
        tracking_details: undefined,
        delivery_agent_id: undefined,
        items: cartId ? 
          (await this.prisma.cartItem.findMany({ 
            where: { cartId }, 
            include: { product: true } 
          })).map(ci => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: Number(ci.product.price),
            total: ci.quantity * Number(ci.product.price),
          })) : 
          [{
            productId: product.product_id,
            quantity: quantity ?? 1,
            price: Number(product.price),
            total: (quantity ?? 1) * Number(product.price),
          }],
      });

      // 2️⃣ Create Checkout Session in Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
        customer_email: user_email,
        metadata: {
          order_id: String(order.id),
          orderNumber: order.orderNumber,
          user_email,
          user_id: String(user_id),
          ...(product
            ? {
                product_id: String(product.product_id),
                product_name: product.product_name,
                price: String(product.price),
                box_contains: product.box_contains,
                short_Description: product.short_Description?.slice(0, 200),
              }
            : { cartId: String(cartId) }),
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB'], // Configure based on your shipping zones
        },
        billing_address_collection: 'required',
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
