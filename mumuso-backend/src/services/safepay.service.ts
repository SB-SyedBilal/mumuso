// Safepay payment gateway service — Ref: Primary Spec Section 15, Supplement Section 2
// MockSafepayService for development, real adapter for production
// Circuit breaker via opossum — Ref: Supplement Section 11.4

import CircuitBreaker from 'opossum';
import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../middleware/logger';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface SafepayOrderRequest {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface SafepayOrderResponse {
  token: string;
  expiry: number;
}

export interface SafepayService {
  createOrder(request: SafepayOrderRequest): Promise<SafepayOrderResponse>;
  verifyWebhookSignature(payload: string, signatureHeader: string): boolean;
}

// ─── Real Safepay Implementation ────────────────────────────────────────────
// Ref: Supplement Section 2.1

class RealSafepayService implements SafepayService {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;
  private breaker: CircuitBreaker<SafepayOrderRequest, SafepayOrderResponse>;

  constructor() {
    this.baseUrl = env.SAFEPAY_BASE_URL;
    this.apiKey = env.SAFEPAY_API_KEY;
    this.webhookSecret = env.SAFEPAY_WEBHOOK_SECRET;

    // Circuit breaker for createOrder — Ref: Supplement Section 11.4
    this.breaker = new CircuitBreaker(
      (request: SafepayOrderRequest) => this._createOrderDirect(request),
      {
        timeout: 5000, // 5s timeout
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30s cooldown
      },
    );

    this.breaker.on('open', () => {
      logger.error('Safepay circuit breaker opened — gateway unavailable');
    });

    this.breaker.on('halfOpen', () => {
      logger.info('Safepay circuit breaker half-open — testing recovery');
    });
  }

  async createOrder(request: SafepayOrderRequest): Promise<SafepayOrderResponse> {
    return this.breaker.fire(request);
  }

  // Actual order creation logic wrapped by circuit breaker
  private async _createOrderDirect(request: SafepayOrderRequest): Promise<SafepayOrderResponse> {
    // Authorization Decision A: Generate idempotency key — user:plan:date format
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${request.userId}:${request.planId}:${new Date().toISOString().split('T')[0]}`)
      .digest('hex')
      .slice(0, 64);
    // Ref: Supplement Section 2.1 — Order Creation Endpoint
    const response = await fetch(`${this.baseUrl}/order/v1/init`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: 'mobile_sdk',
        amount: request.amount,
        currency: request.currency,
        environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        order_id: request.orderId,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        source: 'mobile_app',
        webhook_url: `${env.API_BASE_URL}/api/v1/membership/webhook/safepay`,
        idempotency_key: idempotencyKey,
        redirect_url: 'mumuso://payment/callback',
        cancel_url: 'mumuso://payment/cancel',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Safepay order creation failed', {
        status: response.status,
        body: errorBody,
      });
      throw new Error(`Safepay API error: ${response.status}`);
    }

    const data = (await response.json()) as { status: string; data: SafepayOrderResponse };
    return data.data;
  }

  // Ref: Primary Spec Section 15 — Webhook Verification
  verifyWebhookSignature(payload: string, signatureHeader: string): boolean {
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader),
        Buffer.from(expectedSig),
      );
    } catch {
      return false;
    }
  }
}

// ─── Mock Safepay Implementation ────────────────────────────────────────────
// Configurable scenarios via SAFEPAY_MOCK_SCENARIO env var

class MockSafepayService implements SafepayService {
  async createOrder(request: SafepayOrderRequest): Promise<SafepayOrderResponse> {
    const scenario = env.SAFEPAY_MOCK_SCENARIO || 'SUCCESS';

    logger.info(`[MOCK SAFEPAY] Creating order — scenario: ${scenario}`, {
      orderId: request.orderId,
      amount: request.amount,
    });

    switch (scenario) {
      case 'TIMEOUT':
        // Simulate timeout — no response (tests reconciliation job)
        await new Promise((resolve) => setTimeout(resolve, 10000));
        throw new Error('Safepay timeout');

      case 'FAILED':
        throw new Error('Safepay payment failed (mock)');

      case 'SUCCESS':
      case 'DUPLICATE_WEBHOOK':
      default:
        return {
          token: `sfpy_mock_${request.orderId}_${Date.now()}`,
          expiry: 300,
        };
    }
  }

  verifyWebhookSignature(_payload: string, _signatureHeader: string): boolean {
    // In mock mode, always verify successfully
    logger.info('[MOCK SAFEPAY] Webhook signature verification — always true in mock mode');
    return true;
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createSafepayService(): SafepayService {
  if (env.NODE_ENV === 'production' && env.SAFEPAY_API_KEY) {
    return new RealSafepayService();
  }
  return new MockSafepayService();
}

export const safepayService = createSafepayService();
