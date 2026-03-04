// Admin module validation schemas — Ref: Law 2.3 (Input validation at boundary)

import { z } from 'zod';

// ─── Dashboard Stats ────────────────────────────────────────────────────────
export const dashboardStatsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'all']).optional().default('month'),
});

export type DashboardStatsQueryInput = z.infer<typeof dashboardStatsQuerySchema>;

// ─── List Members ───────────────────────────────────────────────────────────
export const listMembersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['active', 'expired', 'suspended', 'all']).optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'expiry_date', 'total_saved', 'name']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListMembersQueryInput = z.infer<typeof listMembersQuerySchema>;

// ─── List Transactions ──────────────────────────────────────────────────────
export const listTransactionsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  store_id: z.string().optional(),
  member_id: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  discount_type: z.enum(['full', 'partial', 'all']).optional(),
  min_amount: z.string().optional(),
  max_amount: z.string().optional(),
  sort_by: z.enum(['created_at', 'discount_amount', 'final_amount']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListTransactionsQueryInput = z.infer<typeof listTransactionsQuerySchema>;

// ─── Store Management ───────────────────────────────────────────────────────
export const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().optional().default('Pakistan'),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  discount_pct: z.number().min(0).max(100),
  operating_hours: z.record(z.any()).optional(),
  is_active: z.boolean().optional().default(true),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  discount_pct: z.number().min(0).max(100).optional(),
  operating_hours: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

export const storeIdParamSchema = z.object({
  id: z.string().uuid(),
});

// ─── Export Reports ─────────────────────────────────────────────────────────
export const exportReportQuerySchema = z.object({
  report_type: z.enum(['members', 'transactions', 'revenue', 'stores']),
  format: z.enum(['csv', 'json']).optional().default('csv'),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  store_id: z.string().optional(),
});

export type ExportReportQueryInput = z.infer<typeof exportReportQuerySchema>;

// ─── Member Details ─────────────────────────────────────────────────────────
export const memberIdParamSchema = z.object({
  id: z.string().uuid(),
});

// ─── Update Member Status ───────────────────────────────────────────────────
export const updateMemberStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z.string().optional(),
});

export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;
