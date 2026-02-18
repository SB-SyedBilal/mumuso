// Zod validation schemas for member endpoints — Ref: Primary Spec Section 8

import { z } from 'zod';

// PUT /member/profile — Ref: Primary Spec Section 8
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+923\d{9}$/, 'Phone must be valid Pakistani format (+923XXXXXXXXX)')
    .optional(),
  // Email cannot be updated — reject if included
  email: z.undefined({ invalid_type_error: 'Email cannot be updated' }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// POST /member/device-token — Ref: Primary Spec Section 8
export const deviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  platform: z.enum(['ios', 'android']),
});

export type DeviceTokenInput = z.infer<typeof deviceTokenSchema>;

// DELETE /member/device-token — Ref: Supplement Section 6.3
export const deleteDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
});

export type DeleteDeviceTokenInput = z.infer<typeof deleteDeviceTokenSchema>;

// PUT /member/notification-preferences — Ref: Primary Spec Section 8
export const notificationPreferencesSchema = z.object({
  promo_offers: z.boolean().optional(),
  renewal_reminders: z.boolean().optional(),
  transaction_confirm: z.boolean().optional(),
  new_store_alerts: z.boolean().optional(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

// GET /member/transactions query params — Ref: Primary Spec Section 8
export const transactionsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  store_id: z.string().uuid().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export type TransactionsQueryInput = z.infer<typeof transactionsQuerySchema>;
