// Admin controller — request/response handling — Ref: Law 3.1 (Single Responsibility)
// Delegates business logic to admin.service.ts

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import * as adminService from './admin.service';
import {
  DashboardStatsQueryInput,
  ListMembersQueryInput,
  ListTransactionsQueryInput,
  CreateStoreInput,
  UpdateStoreInput,
  ExportReportQueryInput,
  UpdateMemberStatusInput,
} from './admin.schema';

// GET /admin/dashboard
export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.getDashboardStats(
      req.query as unknown as DashboardStatsQueryInput,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/members
export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.listMembers(req.query as unknown as ListMembersQueryInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/members/:id
export async function getMemberDetails(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.getMemberDetails(req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// PUT /admin/members/:id/status
export async function updateMemberStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.updateMemberStatus(
      req.params.id,
      req.body as UpdateMemberStatusInput,
      req.user!.id,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/transactions
export async function listTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.listTransactions(
      req.query as unknown as ListTransactionsQueryInput,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/stores
export async function listStores(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.listStores();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /admin/stores
export async function createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.createStore(req.body as CreateStoreInput, req.user!.id);
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

// PUT /admin/stores/:id
export async function updateStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.updateStore(
      req.params.id,
      req.body as UpdateStoreInput,
      req.user!.id,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/reports/export
export async function exportReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.exportReport(
      req.query as unknown as ExportReportQueryInput,
    );

    // Set appropriate headers for download
    if (result.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

      // Convert JSON to CSV
      if (result.data.length > 0) {
        const headers = Object.keys(result.data[0] as Record<string, unknown>).join(',');
        const rows = result.data.map((row) =>
          Object.values(row as Record<string, unknown>)
            .map((val) => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
            .join(','),
        );
        res.send([headers, ...rows].join('\n'));
      } else {
        res.send('');
      }
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      sendSuccess(res, result);
    }
  } catch (error) {
    next(error);
  }
}
