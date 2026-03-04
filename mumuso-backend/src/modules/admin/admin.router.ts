// Admin routes — Ref: Law 5.1 (Contract-first development)
// Base path: /api/v1/admin — All routes require admin role

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  dashboardStatsQuerySchema,
  listMembersQuerySchema,
  listTransactionsQuerySchema,
  createStoreSchema,
  updateStoreSchema,
  storeIdParamSchema,
  exportReportQuerySchema,
  memberIdParamSchema,
  updateMemberStatusSchema,
} from './admin.schema';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require authentication + super_admin role — Ref: Law 2.2 (Least privilege)
router.use(authenticate, requireRole('super_admin'));

// ─── Dashboard Stats ────────────────────────────────────────────────────────
// GET /admin/dashboard
router.get(
  '/dashboard',
  validate({ query: dashboardStatsQuerySchema }),
  adminController.getDashboardStats,
);

// ─── Member Management ──────────────────────────────────────────────────────
// GET /admin/members — List all members with filters
router.get(
  '/members',
  validate({ query: listMembersQuerySchema }),
  adminController.listMembers,
);

// GET /admin/members/:id — Get member details
router.get(
  '/members/:id',
  validate({ params: memberIdParamSchema }),
  adminController.getMemberDetails,
);

// PUT /admin/members/:id/status — Update member status (suspend/activate)
router.put(
  '/members/:id/status',
  validate({ params: memberIdParamSchema, body: updateMemberStatusSchema }),
  adminController.updateMemberStatus,
);

// ─── Transaction Management ─────────────────────────────────────────────────
// GET /admin/transactions — List all transactions with advanced filters
router.get(
  '/transactions',
  validate({ query: listTransactionsQuerySchema }),
  adminController.listTransactions,
);

// ─── Store Management ───────────────────────────────────────────────────────
// GET /admin/stores — List all stores
router.get('/stores', adminController.listStores);

// POST /admin/stores — Create new store
router.post('/stores', validate({ body: createStoreSchema }), adminController.createStore);

// PUT /admin/stores/:id — Update store
router.put(
  '/stores/:id',
  validate({ params: storeIdParamSchema, body: updateStoreSchema }),
  adminController.updateStore,
);

// ─── Reports & Export ───────────────────────────────────────────────────────
// GET /admin/reports/export — Export data in CSV or JSON
router.get(
  '/reports/export',
  validate({ query: exportReportQuerySchema }),
  adminController.exportReport,
);

export default router;
