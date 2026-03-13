// Zod validation schemas for POS endpoints

import { z } from 'zod';

// POST /api/pos/validate-membership
export const validateMembershipSchema = z.object({
  member_id: z.string().regex(/^MUM-\d{5,6}$/, 'Invalid member ID format'),
  store_id: z.string().uuid(),
  cart_total: z.number().positive(),
  timestamp: z.string().datetime(),
});

export type ValidateMembershipInput = z.infer<typeof validateMembershipSchema>;

// POST /api/pos/record-transaction
export const recordTransactionSchema = z.object({
  transaction_id: z.string(),
  member_id: z.string().regex(/^MUM-\d{5,6}$/),
  store_id: z.string().uuid(),
  store_name: z.string(),
  timestamp: z.string().datetime(),
  original_amount: z.number().positive(),
  discount_amount: z.number().min(0),
  final_amount: z.number().positive(),
  tax_amount: z.number().min(0),
  payment_method: z.enum(['cash', 'card', 'mobile']),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      unit_price: z.number().positive(),
      subtotal: z.number().positive(),
    }),
  ),
  cashier_id: z.string(),
  pos_terminal_id: z.string(),
});

export type RecordTransactionInput = z.infer<typeof recordTransactionSchema>;
