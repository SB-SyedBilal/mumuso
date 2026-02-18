// Notifications controller — Ref: Primary Spec Section 13

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import * as notificationsService from './notifications.service';
import { NotificationsQueryInput } from './notifications.schema';

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationsService.listNotifications(
      req.user!.id,
      req.query as unknown as NotificationsQueryInput,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationsService.markAsRead(req.user!.id, req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationsService.markAllAsRead(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
