// Stores controller — Ref: Primary Spec Section 10

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import * as storesService from './stores.service';
import { StoresQueryInput } from './stores.schema';

export async function listStores(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await storesService.listStores(req.query as unknown as StoresQueryInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getStoreById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await storesService.getStoreById(req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
