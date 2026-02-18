// Member controller — Ref: Primary Spec Section 8

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import * as memberService from './member.service';
import {
  UpdateProfileInput,
  DeviceTokenInput,
  DeleteDeviceTokenInput,
  NotificationPreferencesInput,
  TransactionsQueryInput,
} from './member.schema';

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.getDashboard(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function qrToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.getQRToken(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function status(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.getMemberStatus(req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.updateProfile(req.user!.id, req.body as UpdateProfileInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function registerDeviceToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.registerDeviceToken(req.user!.id, req.body as DeviceTokenInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function deleteDeviceToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.deleteDeviceToken(req.user!.id, req.body as DeleteDeviceTokenInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateNotificationPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.updateNotificationPreferences(req.user!.id, req.body as NotificationPreferencesInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.getTransactions(req.user!.id, req.query as unknown as TransactionsQueryInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await memberService.getTransactionById(req.user!.id, req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
