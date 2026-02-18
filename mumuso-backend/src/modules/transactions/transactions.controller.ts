// Transactions controller — Ref: Primary Spec Section 12

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import * as transactionsService from './transactions.service';
import { RecordTransactionInput, SyncTransactionsInput } from './transactions.schema';

// POST /transactions/record
export async function recordTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await transactionsService.recordTransaction(
      req.body as RecordTransactionInput,
      req.user!.id,
    );
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /transactions/sync
export async function syncTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await transactionsService.syncTransactions(
      req.body as SyncTransactionsInput,
      req.user!.id,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
