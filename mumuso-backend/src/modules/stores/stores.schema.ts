// Zod validation schemas for stores endpoints — Ref: Primary Spec Section 10

import { z } from 'zod';

export const storesQuerySchema = z.object({
  city: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['discount_asc', 'discount_desc']).optional(),
});

export type StoresQueryInput = z.infer<typeof storesQuerySchema>;

export const storeIdParamSchema = z.object({
  id: z.string().uuid(),
});
