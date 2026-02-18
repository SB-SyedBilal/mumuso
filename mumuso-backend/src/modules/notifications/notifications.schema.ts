// Zod validation schemas for notifications endpoints — Ref: Primary Spec Section 13

import { z } from 'zod';

export const notificationsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  unread_only: z.string().optional(), // "true" or "false"
});

export type NotificationsQueryInput = z.infer<typeof notificationsQuerySchema>;

export const markReadSchema = z.object({
  notification_id: z.string().uuid(),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;
