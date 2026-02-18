// Auth controller — request/response handling — Ref: Primary Spec Section 7
// Delegates business logic to auth.service.ts

import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendError, ErrorCodes } from '../../utils/response';
import * as authService from './auth.service';
import {
  RegisterInput,
  VerifyOTPInput,
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.schema';

// POST /auth/register
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body as RegisterInput);
    sendCreated(res, { ...result, message: 'OTP sent to your phone number' });
  } catch (error) {
    next(error);
  }
}

// POST /auth/verify-otp
export async function verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.verifyOTP(req.body as VerifyOTPInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /auth/login
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body as LoginInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.refreshAccessToken(req.body as RefreshInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /auth/logout
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.body?.refresh_token as string | undefined;
    if (!refreshToken) {
      sendError(res, ErrorCodes.VALIDATION_ERROR.code, 'Refresh token is required', 400);
      return;
    }
    await authService.logoutUser(refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

// POST /auth/forgot-password
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body as ForgotPasswordInput);
    // Always return success — never reveal if email exists — Ref: Primary Spec Section 7
    sendSuccess(res, { message: 'If the email exists, a reset code has been sent' });
  } catch (error) {
    next(error);
  }
}

// POST /auth/reset-password
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resetPassword(req.body as ResetPasswordInput);
    sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

// POST /auth/change-password
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.changePassword(req.user!.id, req.body as ChangePasswordInput);
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}
