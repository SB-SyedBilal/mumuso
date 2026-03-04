// Membership controller — Ref: Primary Spec Section 9, 15

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { safepayService } from '../../services/safepay.service';
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

// GET /membership/renewal-info
export async function renewalInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await membershipService.getRenewalInfo(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
