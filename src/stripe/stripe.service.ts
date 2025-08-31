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
