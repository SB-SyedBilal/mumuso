// Stripe payment gateway service — Test mode for demos
// MockStripeService for development, real adapter for production
// Circuit breaker via opossum — follows SafePay pattern

import CircuitBreaker from 'opossum';
import crypto from 'crypto';
import Stripe from 'stripe';
import { env } from '../config/env';
import { logger } from '../middleware/logger';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface StripeOrderRequest {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface StripeOrderResponse {
  sessionId: string;
  clientSecret: string;
  expiry: number;
}

export interface StripeService {
  createCheckoutSession(request: StripeOrderRequest): Promise<StripeOrderResponse>;
  verifyWebhookSignature(payload: string, signatureHeader: string): boolean;
  constructWebhookEvent(payload: string, signature: string): Stripe.Event | null;
}

// ─── Real Stripe Implementation ────────────────────────────────────────────

class RealStripeService implements StripeService {
  private stripe: Stripe;
  private webhookSecret: string;
  private breaker: CircuitBreaker<StripeOrderRequest, StripeOrderResponse>;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
    this.webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    // Circuit breaker for createCheckoutSession
    this.breaker = new CircuitBreaker(
      (request: StripeOrderRequest) => this._createCheckoutSessionDirect(request),
      {
        timeout: 5000, // 5s timeout
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30s cooldown
      },
    );

    this.breaker.on('open', () => {
      logger.error('Stripe circuit breaker opened — gateway unavailable');
    });

    this.breaker.on('halfOpen', () => {
      logger.info('Stripe circuit breaker half-open — testing recovery');
    });
  }

  async createCheckoutSession(request: StripeOrderRequest): Promise<StripeOrderResponse> {
    return this.breaker.fire(request);
  }

  // Actual checkout session creation logic wrapped by circuit breaker
  private async _createCheckoutSessionDirect(
    request: StripeOrderRequest,
  ): Promise<StripeOrderResponse> {
    try {
      // Create or retrieve customer
      const customers = await this.stripe.customers.list({
        email: request.customerEmail,
        limit: 1,
      });

      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await this.stripe.customers.create({
          email: request.customerEmail,
          name: request.customerName,
          phone: request.customerPhone,
          metadata: {
            userId: request.userId,
          },
        });
        customerId = customer.id;
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              product_data: {
                name: 'Mumuso Membership',
                description: 'Annual membership with exclusive discounts',
              },
              unit_amount: Math.round(request.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${env.API_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.API_BASE_URL}/payment/cancel`,
        metadata: {
          orderId: request.orderId,
          userId: request.userId,
          planId: request.planId,
        },
        client_reference_id: request.orderId,
        expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
      });

      logger.info('Stripe checkout session created', {
        sessionId: session.id,
        orderId: request.orderId,
        amount: request.amount,
      });

      return {
        sessionId: session.id,
        clientSecret: session.client_secret || '',
        expiry: 1800, // 30 minutes in seconds
      };
    } catch (error) {
      logger.error('Stripe checkout session creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: request.orderId,
      });
      throw error;
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signatureHeader: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signatureHeader, this.webhookSecret);
      return true;
    } catch (error) {
      logger.warn('Stripe webhook signature verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Construct webhook event
  constructWebhookEvent(payload: string, signature: string): Stripe.Event | null {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      logger.error('Failed to construct Stripe webhook event', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}

// ─── Mock Stripe Implementation ────────────────────────────────────────────
// Configurable scenarios via STRIPE_MOCK_SCENARIO env var

class MockStripeService implements StripeService {
  async createCheckoutSession(request: StripeOrderRequest): Promise<StripeOrderResponse> {
    const scenario = env.STRIPE_MOCK_SCENARIO || 'SUCCESS';

    logger.info(`[MOCK STRIPE] Creating checkout session — scenario: ${scenario}`, {
      orderId: request.orderId,
      amount: request.amount,
    });

    switch (scenario) {
      case 'TIMEOUT':
        await new Promise((resolve) => setTimeout(resolve, 10000));
        throw new Error('Stripe timeout');

      case 'FAILED':
        throw new Error('Stripe payment failed (mock)');

      case 'SUCCESS':
      case 'DUPLICATE_WEBHOOK':
      default:
        return {
          sessionId: `cs_test_mock_${request.orderId}_${Date.now()}`,
          clientSecret: `cs_test_secret_${crypto.randomBytes(16).toString('hex')}`,
          expiry: 1800,
        };
    }
  }

  verifyWebhookSignature(_payload: string, _signatureHeader: string): boolean {
    logger.info('[MOCK STRIPE] Webhook signature verification — always true in mock mode');
    return true;
  }

  constructWebhookEvent(payload: string, _signature: string): Stripe.Event | null {
    try {
      return JSON.parse(payload) as Stripe.Event;
    } catch {
      return null;
    }
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createStripeService(): StripeService {
  if (env.NODE_ENV === 'production' && env.STRIPE_SECRET_KEY) {
    return new RealStripeService();
  }
  // Use real Stripe in test mode if secret key is provided (starts with sk_test_)
  if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    return new RealStripeService();
  }
  return new MockStripeService();
}

export const stripeService = createStripeService();
