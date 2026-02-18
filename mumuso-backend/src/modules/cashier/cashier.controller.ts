// Cashier controller — Ref: Primary Spec Section 11

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';
import * as cashierService from './cashier.service';
import { ValidateMemberInput } from './cashier.schema';

// POST /cashier/validate — THE MOST CRITICAL ENDPOINT
export async function validateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cashierService.validateMember(
      req.body as ValidateMemberInput,
      req.user!.id,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /cashier/store-config
export async function getStoreConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.store_id) {
      sendError(res, ErrorCodes.FORBIDDEN.code, 'Cashier not assigned to a store', 403);
      return;
    }
    const result = await cashierService.getStoreConfig(req.user.store_id);
    if (!result) {
      sendError(res, ErrorCodes.NOT_FOUND.code, 'Store not found', 404);
      return;
    }
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
