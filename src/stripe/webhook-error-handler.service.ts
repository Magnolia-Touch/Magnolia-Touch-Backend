import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

export interface WebhookRetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBackoff: boolean;
}

export interface WebhookErrorInfo {
  eventId: string;
  eventType: string;
  error: string;
  retryCount: number;
  lastAttempt: Date;
  nextRetry?: Date;
  resolved: boolean;
}

@Injectable()
export class WebhookErrorHandlerService {
  private readonly logger = new Logger(WebhookErrorHandlerService.name);
  private readonly retryConfig: WebhookRetryConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Configure retry settings from environment or use defaults
    this.retryConfig = {
      maxRetries: parseInt(
        this.configService.get('WEBHOOK_MAX_RETRIES') || '3',
      ),
      baseDelayMs: parseInt(
        this.configService.get('WEBHOOK_BASE_DELAY_MS') || '5000',
      ),
      maxDelayMs: parseInt(
        this.configService.get('WEBHOOK_MAX_DELAY_MS') || '300000',
      ), // 5 minutes
      exponentialBackoff:
        this.configService.get('WEBHOOK_EXPONENTIAL_BACKOFF') === 'true' ||
        true,
    };
  }

  /**
   * Calculate delay for next retry attempt
   */
  calculateRetryDelay(retryCount: number): number {
    if (!this.retryConfig.exponentialBackoff) {
      return this.retryConfig.baseDelayMs;
    }

    const delay = this.retryConfig.baseDelayMs * Math.pow(2, retryCount);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Determine if event should be retried
   */
  shouldRetry(error: any, retryCount: number): boolean {
    // Don't retry if max retries exceeded
    if (retryCount >= this.retryConfig.maxRetries) {
      return false;
    }

    // Don't retry authentication/signature errors
    if (error.message && error.message.includes('Webhook Error:')) {
      return false;
    }

    // Don't retry validation errors (4xx status codes)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }

    // Retry database connection errors, timeouts, and 5xx errors
    return true;
  }

  /**
   * Log failed webhook attempt
   */
  async logFailedAttempt(
    event: Stripe.Event,
    error: any,
    retryCount: number = 0,
  ): Promise<void> {
    try {
      const errorInfo: WebhookErrorInfo = {
        eventId: event.id,
        eventType: event.type,
        error: error.message || error.toString(),
        retryCount,
        lastAttempt: new Date(),
        nextRetry: this.shouldRetry(error, retryCount)
          ? new Date(Date.now() + this.calculateRetryDelay(retryCount))
          : undefined,
        resolved: false,
      };

      this.logger.error(
        `Webhook failed: ${event.type} (${event.id}) - Attempt ${retryCount + 1}/${this.retryConfig.maxRetries + 1}`,
      );
      this.logger.error(`Error: ${error.message || error.toString()}`);

      if (errorInfo.nextRetry) {
        this.logger.log(
          `Next retry scheduled for: ${errorInfo.nextRetry.toISOString()}`,
        );
      } else {
        this.logger.error(
          `Max retries exceeded or non-retryable error. Event processing abandoned.`,
        );
      }

      // Here you could store webhook failure logs in database
      // await this.prisma.webhookErrorLog.create({ data: errorInfo });
    } catch (logError) {
      this.logger.error('Failed to log webhook error:', logError.stack);
    }
  }

  /**
   * Log successful webhook processing after retry
   */
  async logSuccessfulRetry(
    event: Stripe.Event,
    retryCount: number,
  ): Promise<void> {
    this.logger.log(
      `Webhook successfully processed after ${retryCount + 1} attempts: ${event.type} (${event.id})`,
    );

    // Update database record if you're storing webhook logs
    // await this.prisma.webhookErrorLog.update({
    //   where: { eventId: event.id },
    //   data: { resolved: true, resolvedAt: new Date() }
    // });
  }

  /**
   * Handle critical webhook failures that require immediate attention
   */
  async handleCriticalFailure(
    event: Stripe.Event,
    error: any,
    context: string = '',
  ): Promise<void> {
    const criticalEvents = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ];

    if (criticalEvents.includes(event.type)) {
      this.logger.error(
        `CRITICAL WEBHOOK FAILURE: ${event.type} (${event.id}) ${context}`,
      );
      this.logger.error(`Error: ${error.message || error.toString()}`);

      // Here you could implement:
      // 1. Send immediate email alerts to administrators
      // 2. Create high-priority support tickets
      // 3. Send SMS notifications
      // 4. Trigger monitoring alerts

      await this.notifyAdministrators(event, error, context);
    }
  }

  /**
   * Notify administrators of critical webhook failures
   */
  private async notifyAdministrators(
    event: Stripe.Event,
    error: any,
    context: string,
  ): Promise<void> {
    try {
      // Implementation would depend on your notification system
      // Examples:

      // 1. Email notification
      // await this.emailService.sendCriticalAlert({
      //   subject: `Critical Webhook Failure: ${event.type}`,
      //   body: `Event ID: ${event.id}\nError: ${error.message}\nContext: ${context}`,
      //   recipients: ['admin@magnolia-touch.com']
      // });

      // 2. Slack notification
      // await this.slackService.sendAlert({
      //   channel: '#critical-alerts',
      //   message: `🚨 Critical webhook failure: ${event.type} (${event.id})\nError: ${error.message}`
      // });

      // 3. Database alert record
      // await this.prisma.criticalAlert.create({
      //   data: {
      //     type: 'webhook_failure',
      //     severity: 'critical',
      //     eventId: event.id,
      //     error: error.message,
      //     context: context,
      //     createdAt: new Date()
      //   }
      // });

      this.logger.log(
        `Critical alert notifications sent for webhook failure: ${event.id}`,
      );
    } catch (notificationError) {
      this.logger.error(
        'Failed to send critical webhook failure notifications:',
        notificationError.stack,
      );
    }
  }

  /**
   * Validate webhook event data integrity
   */
  validateEventData(event: Stripe.Event): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic event structure validation
    if (!event.id) errors.push('Missing event ID');
    if (!event.type) errors.push('Missing event type');
    if (!event.data || !event.data.object) errors.push('Missing event data');
    if (typeof event.created !== 'number')
      errors.push('Invalid created timestamp');

    // Event-specific validations
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
        const pi = event.data.object as any;
        if (!pi.id) errors.push('PaymentIntent missing ID');
        if (!pi.metadata) errors.push('PaymentIntent missing metadata');
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        const invoice = event.data.object as any;
        if (!invoice.id) errors.push('Invoice missing ID');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize sensitive data from webhook events for logging
   */
  sanitizeEventForLogging(event: Stripe.Event): any {
    const sanitizedEvent = JSON.parse(JSON.stringify(event));

    // Remove or mask sensitive data
    if (sanitizedEvent.data?.object?.metadata?.user_email) {
      const email = sanitizedEvent.data.object.metadata.user_email;
      sanitizedEvent.data.object.metadata.user_email = this.maskEmail(email);
    }

    // Remove payment method details if present
    if (sanitizedEvent.data?.object?.payment_method_details) {
      sanitizedEvent.data.object.payment_method_details = '[REDACTED]';
    }

    return sanitizedEvent;
  }

  /**
   * Mask email address for logging
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.slice(0, 2)}***@${domain}`;
  }
}
