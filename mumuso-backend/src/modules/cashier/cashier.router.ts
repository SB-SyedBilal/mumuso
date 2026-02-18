// Cashier routes — Ref: Primary Spec Section 11
// Base path: /api/v1/cashier — Authenticated, cashier role only

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { cashierValidateLimiter } from '../../middleware/rateLimiter';
import { validateMemberSchema } from './cashier.schema';
import * as cashierController from './cashier.controller';

const router = Router();

router.use(authenticate, requireRole('cashier'));

// POST /cashier/validate — 120 per cashier per minute
router.post(
  '/validate',
  cashierValidateLimiter,
  validate({ body: validateMemberSchema }),
  cashierController.validateMember,
);

// GET /cashier/store-config
router.get('/store-config', cashierController.getStoreConfig);

export default router;
