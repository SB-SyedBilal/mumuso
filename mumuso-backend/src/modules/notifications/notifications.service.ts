// Notifications service — Ref: Primary Spec Section 13

import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePaginationParams, buildPaginationResult, getSkip } from '../../utils/pagination';
import { NotificationsQueryInput } from './notifications.schema';

// GET /notifications — Ref: Primary Spec Section 13
export async function listNotifications(userId: string, query: NotificationsQueryInput) {
  const { page, limit } = parsePaginationParams(query);
  const skip = getSkip(page, limit);

  const where: Record<string, unknown> = { user_id: userId };
  if (query.unread_only === 'true') {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { user_id: userId, read: false } }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      deep_link: n.deep_link,
      read: n.read,
      metadata: n.metadata,
      created_at: n.created_at,
    })),
    unread_count: unreadCount,
    pagination: buildPaginationResult(page, limit, total),
  };
}

// PUT /notifications/:id/read — Ref: Primary Spec Section 13
export async function markAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    throw new AppError('NOT_FOUND', 'Notification not found', 404);
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return { read: true };
}

// PUT /notifications/read-all — Ref: Primary Spec Section 13
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true },
  });

  return { marked_read: result.count };
}
