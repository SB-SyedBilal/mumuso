// Cursor/offset pagination helpers — Ref: Primary Spec Section 8 (GET /transactions)

import { PaginationParams, PaginationResult } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export function parsePaginationParams(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );

  return { page, limit };
}

export function buildPaginationResult(
  page: number,
  limit: number,
  total: number,
): PaginationResult {
  return {
    page,
    limit,
    total,
    has_more: page * limit < total,
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
