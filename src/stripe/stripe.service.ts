import { Inject, Injectable, Logger } from '@nestjs/common';
import { generate } from 'rxjs';
import Stripe from 'stripe';
import { generateOrderIdforProduct, generateOrderIdforService } from 'src/utils/code-generator.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { CheckoutDto } from './dto/checkout.dto';




@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
    private prisma: PrismaService,
    private orderservice: OrdersService
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-06-30.basil', // Use latest API version, or "null" for your default
    });
  }

  async createPaymentIntentforProduct(
    checkoutdto: CheckoutDto,
    user_email: string,
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
    const { shippingaddressId, billingaddressId, currency } = checkoutdto
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
      else if (product_id) {
        product = await this.prisma.products.findUnique({
          where: { product_id },
        });

        if (!product) throw new Error(`Product with ID ${product_id} not found`);

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
        User_id: 1, // TODO: replace with req.user.id
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
        amount: Math.round(subtotal * 100), // Stripe expects smallest currency unit (e.g. cents)
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


  // #need to create webhook to confirm payment and thereafter confirm product order

  async createPaymentIntentforService(
    amount: number,
    currency: string,
    service_id: string, // Assuming you want to include service_id in metadata
    user_email: string

  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          service_id: service_id,
          order_id: generateOrderIdforService(),
          description: 'Payment for Book Service',
          user_email: user_email, // Include user email in metadata
        }
      });
      this.logger.log(
        `PaymentIntent created successfully with amount: ${amount} ${currency}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw error;
    }
  }

  // // Refunds (Process Refund)
  // async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
  //   try {
  //     const refund = await this.stripe.refunds.create({
  //       payment_intent: paymentIntentId,
  //     });
  //     this.logger.log(
  //       `Refund processed successfully for PaymentIntent: ${paymentIntentId}`,
  //     );
  //     return refund;
  //   } catch (error) {
  //     this.logger.error('Failed to process refund', error.stack);
  //     throw error;
  //   }
  // }

  // // Payment Method Integration (Attach Payment Method)
  // async attachPaymentMethod(
  //   customerId: string,
  //   paymentMethodId: string,
  // ): Promise<void> {
  //   try {
  //     await this.stripe.paymentMethods.attach(paymentMethodId, {
  //       customer: customerId,
  //     });
  //     this.logger.log(
  //       `Payment method ${paymentMethodId} attached to customer ${customerId}`,
  //     );
  //   } catch (error) {
  //     this.logger.error('Failed to attach payment method', error.stack);
  //     throw error;
  //   }
  // }

  // // Reports and Analytics (Retrieve Balance)
  // async getBalance(): Promise<Stripe.Balance> {
  //   try {
  //     const balance = await this.stripe.balance.retrieve();
  //     this.logger.log('Balance retrieved successfully');
  //     return balance;
  //   } catch (error) {
  //     this.logger.error('Failed to retrieve balance', error.stack);
  //     throw error;
  //   }
  // }

  // // Payment Links
  // async createPaymentLink(priceId: string): Promise<Stripe.PaymentLink> {
  //   try {
  //     const paymentLink = await this.stripe.paymentLinks.create({
  //       line_items: [{ price: priceId, quantity: 1 }],
  //     });
  //     this.logger.log('Payment link created successfully');
  //     return paymentLink;
  //   } catch (error) {
  //     this.logger.error('Failed to create payment link', error.stack);
  //     throw error;
  //   }
  // }

  // async createSubscription(
  //   customerId: string,
  //   priceId: string,
  // ): Promise<Stripe.Subscription> {
  //   try {
  //     const subscription = await this.stripe.subscriptions.create({
  //       customer: customerId,
  //       items: [{ price: priceId }],
  //     });
  //     this.logger.log(
  //       `Subscription created successfully for customer ${customerId}`,
  //     );
  //     return subscription;
  //   } catch (error) {
  //     this.logger.error('Failed to create subscription', error.stack);
  //     throw error;
  //   }
  // }

}
