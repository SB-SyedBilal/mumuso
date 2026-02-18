// Zod validation schemas for auth endpoints — Ref: Primary Spec Section 7

import { z } from 'zod';

// Pakistani phone format: +923XXXXXXXXX
const pakistaniPhoneRegex = /^\+923\d{9}$/;

// Password: min 8 chars, uppercase, lowercase, number — Ref: Primary Spec Section 19
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// POST /auth/register — Ref: Primary Spec Section 7
export const registerSchema = z
  .object({
    full_name: z.string().min(2).max(100),
    email: z.string().email().max(150),
    phone: z.string().regex(pakistaniPhoneRegex, 'Phone must be valid Pakistani format (+923XXXXXXXXX)'),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// POST /auth/verify-otp — Ref: Primary Spec Section 7
export const verifyOTPSchema = z.object({
  user_id: z.string().uuid(),
  code: z.string().length(6),
  type: z.enum(['registration', 'password_reset']),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

// POST /auth/login — Ref: Primary Spec Section 7
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// POST /auth/refresh — Ref: Primary Spec Section 7
export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

// POST /auth/forgot-password — Ref: Primary Spec Section 7
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// POST /auth/reset-password — Ref: Primary Spec Section 7
export const resetPasswordSchema = z
  .object({
    user_id: z.string().uuid(),
    code: z.string().length(6),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// POST /auth/change-password — Authenticated
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
