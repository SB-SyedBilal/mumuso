// POS routes — Public API for Mock POS Demo
// Base path: /api/pos
// Authentication: API Key (for demo purposes)

import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { validateMembershipSchema, recordTransactionSchema } from './pos.schema';
import * as posController from './pos.controller';

const router = Router();

// Middleware to validate API key (simple demo authentication)
const validateApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  const validKey = process.env.POS_DEMO_API_KEY || 'demo-pos-api-key-12345';

  if (apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
    });
  }

  next();
};

// All POS routes require API key
router.use(validateApiKey);

// POST /api/pos/validate-membership
router.post(
  '/validate-membership',
  validate({ body: validateMembershipSchema }),
  posController.validateMembership,
);

// POST /api/pos/record-transaction
router.post(
  '/record-transaction',
  validate({ body: recordTransactionSchema }),
  posController.recordTransaction,
);

// GET /api/pos/stores
router.get('/stores', posController.getStores);

export default router;
