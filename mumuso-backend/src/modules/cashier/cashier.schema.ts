// Zod validation schemas for cashier endpoints — Ref: Primary Spec Section 11

import { z } from 'zod';

// POST /cashier/validate — Ref: Primary Spec Section 11
// Supports QR scan (preferred) or manual ID entry (fallback)
export const validateMemberSchema = z
  .object({
    qr_token: z.string().optional(),
    member_id: z.string().optional(),
    store_id: z.string().uuid(),
  })
  .refine((data) => data.qr_token || data.member_id, {
    message: 'Either qr_token or member_id must be provided',
    path: ['qr_token'],
  });

export type ValidateMemberInput = z.infer<typeof validateMemberSchema>;
