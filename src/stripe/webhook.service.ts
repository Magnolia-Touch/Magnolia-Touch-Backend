import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { WebhookErrorHandlerService } from './webhook-error-handler.service';
import {
  PaymentIntentMetadata,
  CheckoutSessionMetadata,
  WebhookProcessingResult,
} from './dto/webhook-event.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
    private readonly errorHandler: WebhookErrorHandlerService,
  ) { }

  verifyWebhookSignature(
    body: Buffer,
    signature: string,
    endpointSecret: string,
  ): Stripe.Event {
    const stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-06-30.basil',
    });

    try {
      return stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  async processWebhookEvent(
    event: Stripe.Event,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Check if this event has already been processed (idempotency)
    const existingWebhookLog = await this.checkExistingWebhookEvent(event.id);
    if (existingWebhookLog) {
      this.logger.log(`Event ${event.id} already processed, skipping`);
      return {
        success: true,
        message: `Event ${event.id} already processed`,
      };
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );

        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(
            event.data.object as Stripe.PaymentIntent,
          );

        case 'payment_intent.canceled':
          return await this.handlePaymentCanceled(
            event.data.object as Stripe.PaymentIntent,
          );

        case 'charge.dispute.created':
          return await this.handleChargeDispute(
            event.data.object as Stripe.Dispute,
          );

        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );

        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
          );

        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );

        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );

        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );

        case 'checkout.session.expired':
          return await this.handleCheckoutSessionExpired(
            event.data.object as Stripe.Checkout.Session,
          );

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
          return {
            success: true,
            message: `Unhandled event type: ${event.type}`,
          };
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}:`,
        error.stack,
      );
      return {
        success: false,
        message: `Failed to process ${event.type}`,
        error: error.message,
      };
    }
  }

  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<WebhookProcessingResult> {
    const metadata = paymentIntent.metadata as PaymentIntentMetadata;

    this.logger.log(`Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
    this.logger.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);

    if (metadata.order_id) {
      const orderId = parseInt(metadata.order_id);
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'processing',
        notes: `Payment successful. PaymentIntent: ${paymentIntent.id}`,
      });

      if (metadata.cartId) {
        await this.clearCart(parseInt(metadata.cartId));
      }

      return {
        success: true,
        message: `Order ${orderId} payment processed successfully`,
        orderId: metadata.order_id,
      };
    }

    if (metadata.service_id || metadata.booking_id) {
      return this.handleBookingPaymentSuccess(paymentIntent, metadata);
    }

    return {
      success: true,
      message: 'Payment processed but no specific action taken',
    };
  }

  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<WebhookProcessingResult> {
    const metadata = paymentIntent.metadata as PaymentIntentMetadata;

    this.logger.error(`Payment failed for PaymentIntent: ${paymentIntent.id}`);
    this.logger.error(`Error: ${paymentIntent.last_payment_error?.message}`);

    if (metadata.order_id) {
      const orderId = parseInt(metadata.order_id);
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'cancelled',
        notes: `Payment failed. Error: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      });

      return {
        success: true,
        message: `Order ${orderId} cancelled due to payment failure`,
        orderId: metadata.order_id,
      };
    }

    return { success: true, message: 'Payment failure processed' };
  }

  private async handlePaymentCanceled(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<WebhookProcessingResult> {
    const metadata = paymentIntent.metadata as PaymentIntentMetadata;

    this.logger.log(`Payment canceled for PaymentIntent: ${paymentIntent.id}`);

    if (metadata.order_id) {
      const orderId = parseInt(metadata.order_id);
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'cancelled',
        notes: `Payment canceled. PaymentIntent: ${paymentIntent.id}`,
      });

      return {
        success: true,
        message: `Order ${orderId} cancelled due to payment cancellation`,
        orderId: metadata.order_id,
      };
    }

    return { success: true, message: 'Payment cancellation processed' };
  }

  private async handleChargeDispute(
    dispute: Stripe.Dispute,
  ): Promise<WebhookProcessingResult> {
    this.logger.warn(`Charge dispute created: ${dispute.id}`);
    return {
      success: true,
      message: `Dispute ${dispute.id} logged for review`,
    };
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);

    const subscriptionId = (
      invoice as Stripe.Invoice & { subscription?: string | null }
    ).subscription;
    if (subscriptionId) {
      this.logger.log(`Subscription payment successful for: ${subscriptionId}`);
    }

    return {
      success: true,
      message: `Invoice ${invoice.id} payment processed`,
    };
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<WebhookProcessingResult> {
    this.logger.error(`Invoice payment failed: ${invoice.id}`);

    const subscriptionId = (
      invoice as Stripe.Invoice & { subscription?: string | null }
    ).subscription;
    if (subscriptionId) {
      this.logger.error(`Subscription payment failed for: ${subscriptionId}`);
    }

    return {
      success: true,
      message: `Invoice ${invoice.id} payment failure processed`,
    };
  }

  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Subscription created: ${subscription.id}`);
    return {
      success: true,
      message: `Subscription ${subscription.id} created`,
    };
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    return {
      success: true,
      message: `Subscription ${subscription.id} updated`,
    };
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    return {
      success: true,
      message: `Subscription ${subscription.id} cancelled`,
    };
  }

  private async handleBookingPaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
    metadata: PaymentIntentMetadata,
  ): Promise<WebhookProcessingResult> {
    if (metadata.booking_id) {
      const bookingId = parseInt(metadata.booking_id);
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { is_bought: true, status: 'COMPLETED' },
      });
      return {
        success: true,
        message: `Booking ${bookingId} payment processed successfully`,
        bookingId: metadata.booking_id,
      };
    }

    if (metadata.service_id || metadata.booking_id) {
      const bookingIds = metadata.booking_id || metadata.service_id;
      const booking = await this.prisma.booking.findFirst({
        where: { booking_ids: bookingIds },
      });

      if (booking) {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { is_bought: true, status: 'COMPLETED' },
        });
        return {
          success: true,
          message: `Booking ${booking.booking_ids} payment processed successfully`,
          bookingId: String(booking.id),
        };
      } else {
        this.logger.warn(`No booking found with booking_ids: ${bookingIds}`);
      }
    }

    return {
      success: true,
      message: 'Service payment processed but no booking identifier found',
    };
  }

  private async clearCart(cartId: number): Promise<void> {
    try {
      await this.prisma.cartItem.deleteMany({ where: { cartId } });
      await this.prisma.cart.delete({ where: { cartId } });
      this.logger.log(`Cart ${cartId} cleared after successful payment`);
    } catch (error) {
      this.logger.error(`Failed to clear cart ${cartId}:`, error.stack);
    }
  }

  async logWebhookEvent(
    event: Stripe.Event,
    result: WebhookProcessingResult,
  ): Promise<void> {
    this.logger.log(
      `Webhook Event Processed: ${event.type} - ${result.success ? 'SUCCESS' : 'FAILED'}`,
    );
    this.logger.log(`Event ID: ${event.id}`);
    this.logger.log(`Result: ${result.message}`);
    if (!result.success && result.error) {
      this.logger.error(`Error: ${result.error}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<WebhookProcessingResult> {
    const metadata = session.metadata as CheckoutSessionMetadata;

    this.logger.log(`Checkout session completed: ${session.id}`);
    this.logger.log(`Payment status: ${session.payment_status}`);
    this.logger.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);

    if (session.payment_status === 'paid') {
      // Handle order payment success
      if (metadata.order_id) {
        const orderId = parseInt(metadata.order_id);
        await this.ordersService.updateOrderStatus(orderId, {
          status: 'processing',
          notes: `Payment successful via Checkout Session: ${session.id}`,
        });

        if (metadata.cartId) {
          await this.clearCart(parseInt(metadata.cartId));
        }

        return {
          success: true,
          message: `Order ${orderId} payment processed successfully via checkout session`,
          orderId: metadata.order_id,
        };
      }

      // Handle service booking payment success
      if (metadata.service_id || metadata.booking_id || metadata.booking_ids) {
        return this.handleBookingCheckoutSessionSuccess(session, metadata);
      }
    }

    return {
      success: true,
      message: 'Checkout session processed but no specific action taken',
    };
  }

  private async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session,
  ): Promise<WebhookProcessingResult> {
    const metadata = session.metadata as CheckoutSessionMetadata;

    this.logger.warn(`Checkout session expired: ${session.id}`);

    // Handle order cancellation due to session expiry
    if (metadata.order_id) {
      const orderId = parseInt(metadata.order_id);
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'cancelled',
        notes: `Payment session expired. Session: ${session.id}`,
      });

      return {
        success: true,
        message: `Order ${orderId} cancelled due to session expiry`,
        orderId: metadata.order_id,
      };
    }

    return {
      success: true,
      message: 'Checkout session expiry processed',
    };
  }

  private async handleBookingCheckoutSessionSuccess(
    session: Stripe.Checkout.Session,
    metadata: CheckoutSessionMetadata,
  ): Promise<WebhookProcessingResult> {
    // Handle booking by database ID
    if (metadata.booking_id) {
      const bookingId = parseInt(metadata.booking_id);
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { is_bought: true, status: 'COMPLETED' },
      });
      return {
        success: true,
        message: `Booking ${bookingId} payment processed successfully via checkout session`,
        bookingId: metadata.booking_id,
      };
    }

    // Handle booking by booking_ids string
    if (metadata.service_id || metadata.booking_ids) {
      const bookingIds = metadata.booking_ids || metadata.service_id;
      const booking = await this.prisma.booking.findFirst({
        where: { booking_ids: bookingIds },
      });

      if (booking) {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { is_bought: true, status: 'COMPLETED' },
        });

        // Log successful booking payment for redirect
        this.logger.log(`Booking payment successful - User should be redirected to bookings page for booking ID: ${booking.id}`);

        return {
          success: true,
          message: `Booking ${booking.booking_ids} payment processed successfully via checkout session - redirecting to bookings`,
          bookingId: String(booking.id),
          redirectTo: 'bookings', // Add redirect indicator
        };
      } else {
        this.logger.warn(`No booking found with booking_ids: ${bookingIds}`);
      }
    }

    return {
      success: true,
      message: 'Service checkout session processed but no booking identifier found',
    };
  }

  private async checkExistingWebhookEvent(eventId: string): Promise<boolean> {
    try {
      // You could implement a webhook log table to track processed events
      // For now, we'll use a simple in-memory cache or implement basic logging

      // This is a placeholder - implement based on your database schema
      // Example:
      // const existingLog = await this.prisma.webhookLog.findUnique({
      //   where: { eventId }
      // });
      // return !!existingLog;

      return false; // For now, always process (remove this line when implementing proper logging)
    } catch (error) {
      this.logger.error('Failed to check existing webhook event:', error.stack);
      return false; // If we can't check, proceed with processing
    }
  }
}
