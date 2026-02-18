// Zod validation schemas for transactions endpoints — Ref: Primary Spec Section 12

import { z } from 'zod';

// POST /transactions/record — Ref: Primary Spec Section 12
export const recordTransactionSchema = z.object({
  member_id: z.string().min(1),
  store_id: z.string().uuid(),
  original_amount: z.number().positive('Amount must be positive'),
  discount_type: z.enum(['full', 'partial']).default('full'),
  partial_discount_reason: z.string().max(50).optional(),
});

export type RecordTransactionInput = z.infer<typeof recordTransactionSchema>;

// POST /transactions/sync — Ref: Primary Spec Section 12, Supplement Section 4
// Batch limit: 50 transactions per request — Ref: Supplement Section 4.1
const offlineTransactionSchema = z.object({
  local_id: z.string().min(1, 'local_id is required for deduplication'),
  member_id: z.string().min(1),
  store_id: z.string().uuid(),
  original_amount: z.number().positive(),
  discount_type: z.enum(['full', 'partial']).default('full'),
  partial_discount_reason: z.string().max(50).optional(),
  created_at: z.string().datetime(), // ISO 8601 from cashier device
});

export const syncTransactionsSchema = z.object({
  transactions: z
    .array(offlineTransactionSchema)
    .min(1, 'At least one transaction required')
    .max(50, 'Maximum 50 transactions per sync batch'),
});

export type SyncTransactionsInput = z.infer<typeof syncTransactionsSchema>;
export type OfflineTransactionInput = z.infer<typeof offlineTransactionSchema>;
