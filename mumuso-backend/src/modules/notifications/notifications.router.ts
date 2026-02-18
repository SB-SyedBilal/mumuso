// Notifications routes — Ref: Primary Spec Section 13
// Base path: /api/v1/notifications — Authenticated, customer role

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { notificationsQuerySchema } from './notifications.schema';
import * as notificationsController from './notifications.controller';

const router = Router();

router.use(authenticate, requireRole('customer'));

router.get('/', validate({ query: notificationsQuerySchema }), notificationsController.listNotifications);
router.put('/:id/read', notificationsController.markAsRead);
router.put('/read-all', notificationsController.markAllAsRead);

export default router;
