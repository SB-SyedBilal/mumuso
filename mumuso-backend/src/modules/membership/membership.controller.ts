// Membership controller — Ref: Primary Spec Section 9, 15

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { safepayService } from '../../services/safepay.service';
import { stripeService } from '../../services/stripe.service';
import { logger } from '../../middleware/logger';
import * as membershipService from './membership.service';
import { CreateOrderInput, webhookPayloadSchema } from './membership.schema';

// GET /membership/plans
export async function listPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await membershipService.listPlans();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /membership/create-order
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await membershipService.createOrder(
      req.user!.id,
      req.body as CreateOrderInput,
    );
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /membership/webhook/safepay — Ref: Primary Spec Section 15
// Webhook signature verification before processing
export async function webhookSafepay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signatureHeader = req.headers['x-sfpy-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature — Ref: Primary Spec Section 15
    if (!safepayService.verifyWebhookSignature(rawBody, signatureHeader || '')) {
      logger.warn('Invalid webhook signature', {
        ip: req.ip,
        signature: signatureHeader?.slice(0, 10) + '...',
      });
      sendError(res, 'WEBHOOK_INVALID', 'Invalid webhook signature', 401);
      return;
    }

    // Parse and validate payload
    const parseResult = webhookPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid webhook payload', { errors: parseResult.error.errors });
      sendError(res, 'VALIDATION_ERROR', 'Invalid webhook payload', 400);
      return;
    }

    const result = await membershipService.processWebhook(parseResult.data);

    // Always return 200 to Safepay — Ref: Supplement Section 2.2
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Always return 200 to prevent Safepay retries on our errors
    logger.error('Webhook processing error', { error });
    res.status(200).json({ success: false, error: 'Internal processing error' });
  }
}

// POST /membership/webhook/stripe — Stripe webhook handler
export async function webhookStripe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signatureHeader = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    if (!stripeService.verifyWebhookSignature(rawBody, signatureHeader || '')) {
      logger.warn('Invalid Stripe webhook signature', {
        ip: req.ip,
      });
      sendError(res, 'WEBHOOK_INVALID', 'Invalid webhook signature', 401);
      return;
    }

    // Construct Stripe event
    const event = stripeService.constructWebhookEvent(rawBody, signatureHeader);
    if (!event) {
      logger.error('Failed to construct Stripe webhook event');
      res.status(400).json({ success: false, error: 'Invalid event' });
      return;
    }

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (!orderId) {
        logger.warn('Stripe webhook missing order ID', { sessionId: session.id });
        res.status(200).json({ success: false, error: 'Missing order ID' });
        return;
      }

      // Process as webhook with SafePay-compatible format
      const webhookPayload = {
        event: 'payment.completed',
        data: {
          order_id: orderId,
          payment_id: session.payment_intent || session.id,
          status: 'paid',
          amount: session.amount_total / 100,
          currency: session.currency?.toUpperCase(),
          payment_method: 'card',
        },
      };

      const result = await membershipService.processWebhook(webhookPayload);
      res.status(200).json({ success: true, data: result });
    } else if (event.type === 'checkout.session.expired') {
      logger.info('Stripe checkout session expired', { sessionId: event.data.object.id });
      res.status(200).json({ success: true, message: 'Session expired' });
    } else {
      logger.info('Unhandled Stripe webhook event', { type: event.type });
      res.status(200).json({ success: true, message: 'Event received' });
    }
  } catch (error) {
    logger.error('Stripe webhook processing error', { error });
    res.status(200).json({ success: false, error: 'Internal processing error' });
  }
}

// GET /membership/renewal-info
export async function renewalInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await membershipService.getRenewalInfo(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
