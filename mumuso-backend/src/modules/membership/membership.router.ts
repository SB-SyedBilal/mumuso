// Membership routes — Ref: Primary Spec Section 9
// Base path: /api/v1/membership

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderLimiter } from '../../middleware/rateLimiter';
import { createOrderSchema } from './membership.schema';
import * as membershipController from './membership.controller';

const router = Router();

// GET /membership/plans — Authenticated, customer role
router.get('/plans', authenticate, requireRole('customer'), membershipController.listPlans);

// POST /membership/create-order — Authenticated, customer role — 3 per user per hour
router.post(
  '/create-order',
  authenticate,
  requireRole('customer'),
  createOrderLimiter,
  validate({ body: createOrderSchema }),
  membershipController.createOrder,
);

// GET /membership/renewal-info — Authenticated, customer role
router.get('/renewal-info', authenticate, requireRole('customer'), membershipController.renewalInfo);

// POST /membership/webhook/safepay — Public (verified by signature)
// No auth middleware — Safepay calls this directly
router.post('/webhook/safepay', membershipController.webhookSafepay);

// POST /membership/webhook/stripe — Public (verified by signature)
// No auth middleware — Stripe calls this directly
router.post('/webhook/stripe', membershipController.webhookStripe);

export default router;
