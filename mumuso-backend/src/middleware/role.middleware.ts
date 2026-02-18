// Role-based route guards — Ref: Primary Spec Section 18
// Role check happens server-side on every request. Frontend role-based routing is convenience only.

import { Request, Response, NextFunction } from 'express';
import { sendError, ErrorCodes } from '../utils/response';
import { UserRole } from '../types';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, ErrorCodes.TOKEN_INVALID.code, 'Unauthorised', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        ErrorCodes.FORBIDDEN.code,
        'Forbidden — insufficient role',
        ErrorCodes.FORBIDDEN.status,
      );
      return;
    }

    next();
  };
}
