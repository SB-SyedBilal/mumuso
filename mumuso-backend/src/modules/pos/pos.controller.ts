// POS controller — Public API for Mock POS Demo

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import * as posService from './pos.service';
import { ValidateMembershipInput, RecordTransactionInput } from './pos.schema';

// POST /api/pos/validate-membership
export async function validateMembership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await posService.validateMembership(req.body as ValidateMembershipInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /api/pos/record-transaction
export async function recordTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await posService.recordTransaction(req.body as RecordTransactionInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /api/pos/stores
export async function getStores(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await posService.getStores();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
