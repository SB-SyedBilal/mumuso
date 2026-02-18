// Auth routes — Ref: Primary Spec Section 7
// Base path: /api/v1/auth — All public except /logout

import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
} from '../../middleware/rateLimiter';
import {
  registerSchema,
  verifyOTPSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

// POST /auth/register — Public — 5 per IP per hour
router.post(
  '/register',
  registerLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

// POST /auth/verify-otp — Public
router.post(
  '/verify-otp',
  validate({ body: verifyOTPSchema }),
  authController.verifyOTP,
);

// POST /auth/login — Public — 5 failed per email per 15 min
router.post(
  '/login',
  loginLimiter,
  validate({ body: loginSchema }),
  authController.login,
);

// POST /auth/refresh — Public — 10 per refresh token
router.post(
  '/refresh',
  refreshLimiter,
  validate({ body: refreshSchema }),
  authController.refresh,
);

// POST /auth/logout — Authenticated
router.post('/logout', authenticate, authController.logout);

// POST /auth/forgot-password — Public — 3 per email per hour
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

// POST /auth/reset-password — Public
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

// POST /auth/change-password — Authenticated
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export default router;
