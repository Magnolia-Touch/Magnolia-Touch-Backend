import { Inject, Injectable, Logger } from '@nestjs/common';
import { generate } from 'rxjs';
import Stripe from 'stripe';
import { generateOrderIdforProduct, generateOrderIdforService } from 'src/utils/code-generator.util';
import { PrismaService } from 'src/prisma/prisma.service';




@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  
  constructor(
    @Inject('STRIPE_API_KEY')
    private readonly apiKey: string,
    private prisma: PrismaService
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-06-30.basil', // Use latest API version, or "null" for your default
    });
  }

  // Accept Payments (Create Payment Intent)
  async createPaymentIntentforProduct(
  amount: number,
  currency: string,
  product_id: number,
  user_email: string,
): Promise<Stripe.PaymentIntent> {
  try {
    // 1. Fetch product details from Prisma (or whatever ORM you use)
    const product = await this.prisma.products.findUnique({
      where: { product_id: product_id },
    });

    if (!product) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    // 2. Create PaymentIntent with full product details in metadata
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        product_id: String(product.product_id),
        product_name: product.product_name,
        price: String(product.price),
        box_contains: product.box_contains,
        short_Description: product.short_Description?.slice(0, 200), // trim if too long
        order_id: generateOrderIdforProduct(),
        description: 'Payment for order product',
        user_email: user_email,
      },
    });

    this.logger.log(
      `PaymentIntent created successfully for product ${product.product_name} with amount: ${amount} ${currency}`,
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
