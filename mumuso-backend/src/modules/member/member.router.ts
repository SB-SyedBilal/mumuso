// Member routes — Ref: Primary Spec Section 8
// Base path: /api/v1/member — Authenticated, customer role only

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { qrTokenLimiter } from '../../middleware/rateLimiter';
import {
  updateProfileSchema,
  deviceTokenSchema,
  deleteDeviceTokenSchema,
  notificationPreferencesSchema,
  transactionsQuerySchema,
} from './member.schema';
import * as memberController from './member.controller';

const router = Router();

// All member routes require authentication + customer role
router.use(authenticate, requireRole('customer'));

router.get('/dashboard', memberController.dashboard);
router.get('/qr-token', qrTokenLimiter, memberController.qrToken);
router.get('/status', memberController.status);
router.put('/profile', validate({ body: updateProfileSchema }), memberController.updateProfile);
router.post('/device-token', validate({ body: deviceTokenSchema }), memberController.registerDeviceToken);
router.delete('/device-token', validate({ body: deleteDeviceTokenSchema }), memberController.deleteDeviceToken);
router.put('/notification-preferences', validate({ body: notificationPreferencesSchema }), memberController.updateNotificationPreferences);
router.get('/transactions', validate({ query: transactionsQuerySchema }), memberController.getTransactions);
router.get('/transactions/:id', memberController.getTransactionById);

export default router;
