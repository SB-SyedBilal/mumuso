// Zod validation schemas for membership endpoints — Ref: Primary Spec Section 9

import { z } from 'zod';

// POST /membership/create-order — Ref: Primary Spec Section 9
export const createOrderSchema = z.object({
  plan_id: z.string().uuid(),
  gateway: z.enum(['safepay', 'stripe']).default('safepay'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// POST /membership/webhook/safepay — Ref: Primary Spec Section 15
// Raw body validated via signature, not Zod
export const webhookPayloadSchema = z.object({
  event: z.string(),
  data: z.object({
    order_id: z.string(),
    payment_id: z.string().optional(),
    status: z.string(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    payment_method: z.string().optional(),
  }),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
