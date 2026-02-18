// Transactions routes — Ref: Primary Spec Section 12
// Base path: /api/v1/transactions — Authenticated, cashier role only

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { syncLimiter } from '../../middleware/rateLimiter';
import { recordTransactionSchema, syncTransactionsSchema } from './transactions.schema';
import * as transactionsController from './transactions.controller';

const router = Router();

router.use(authenticate, requireRole('cashier'));

// POST /transactions/record — online recording
router.post(
  '/record',
  validate({ body: recordTransactionSchema }),
  transactionsController.recordTransaction,
);

// POST /transactions/sync — offline batch sync — 10 per cashier per minute
router.post(
  '/sync',
  syncLimiter,
  validate({ body: syncTransactionsSchema }),
  transactionsController.syncTransactions,
);

export default router;
