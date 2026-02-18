// Augmented Express Request type — Ref: Primary Spec Section 5
// Injects user and role into Request after JWT middleware

import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        store_id?: string;
      };
    }
  }
}
