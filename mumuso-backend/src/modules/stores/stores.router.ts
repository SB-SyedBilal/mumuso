// Stores routes — Ref: Primary Spec Section 10
// Base path: /api/v1/stores — Authenticated, customer role

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { storesLimiter } from '../../middleware/rateLimiter';
import { storesQuerySchema, storeIdParamSchema } from './stores.schema';
import * as storesController from './stores.controller';

const router = Router();

router.use(authenticate, requireRole('customer'));

router.get('/', storesLimiter, validate({ query: storesQuerySchema }), storesController.listStores);
router.get('/:id', validate({ params: storeIdParamSchema }), storesController.getStoreById);

export default router;
