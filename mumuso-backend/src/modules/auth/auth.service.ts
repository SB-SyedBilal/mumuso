// Auth service — business logic for authentication — Ref: Primary Spec Section 7
// Handles: register, OTP verification, login, refresh, logout, forgot/reset password

import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { generateTokenPair, decodeRefreshToken, getRefreshTokenTTL } from '../../utils/jwt';
import { generateOTP, getOTPExpiry, isOTPExpired, isOTPLocked } from '../../utils/otp';
import { smsService } from '../../services/sms.service';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';
import {
  RegisterInput,
  VerifyOTPInput,
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.schema';

const BCRYPT_COST_FACTOR = 12; // Ref: Primary Spec Section 19

// POST /auth/register — Ref: Primary Spec Section 7
export async function registerUser(input: RegisterInput) {
  const { full_name, email, phone, password } = input;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Check soft-delete 90-day re-registration block — Authorization Decision 1.5
    if (existingUser.deleted_at) {
      const daysSinceDeleted = Math.floor(
        (Date.now() - existingUser.deleted_at.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceDeleted < 90) {
        throw new AppError(
          'ALREADY_EXISTS',
          'This email was recently deactivated. Please wait before re-registering.',
          409,
        );
      }
    } else {
      throw new AppError('ALREADY_EXISTS', 'Email already registered', 409);
    }
  }

  // Hash password — bcrypt cost factor 12
  const password_hash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  // Create user — role always 'customer' — Ref: Primary Spec Section 7
  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      phone,
      password_hash,
      role: 'customer',
      is_active: false, // Activated after OTP verification
    },
  });

  // Generate and store OTP
  const otpCode = generateOTP();
  await prisma.oTPToken.create({
    data: {
      user_id: user.id,
      phone_or_email: phone,
      code: otpCode,
      type: 'registration',
      expires_at: getOTPExpiry(),
    },
  });

  // Send OTP via SMS
  await smsService.sendOTP(phone, otpCode);

  logger.info('User registered, OTP sent', { userId: user.id, email });

  return { user_id: user.id };
}

// POST /auth/verify-otp — Ref: Primary Spec Section 7
export async function verifyOTP(input: VerifyOTPInput) {
  const { user_id, code, type } = input;

  // Find the latest OTP for this user and type
  const otpRecord = await prisma.oTPToken.findFirst({
    where: {
      user_id,
      type,
      used: false,
    },
    orderBy: { created_at: 'desc' },
  });

  if (!otpRecord) {
    throw new AppError('NOT_FOUND', 'No pending OTP found', 404);
  }

  // Check if locked after 3 failed attempts — Ref: Primary Spec Section 7
  if (isOTPLocked(otpRecord.attempts)) {
    throw new AppError('RATE_LIMITED', 'Too many failed attempts. Request a new OTP.', 429);
  }

  // Check expiry
  if (isOTPExpired(otpRecord.expires_at)) {
    throw new AppError('TOKEN_EXPIRED', 'OTP has expired. Request a new one.', 401);
  }

  // Verify code
  if (otpRecord.code !== code) {
    // Increment attempts — lock after 3 failed
    await prisma.oTPToken.update({
      where: { id: otpRecord.id },
      data: {
        attempts: { increment: 1 },
        // Lock by setting expiry to past if max attempts reached
        ...(otpRecord.attempts + 1 >= 3 ? { expires_at: new Date(0) } : {}),
      },
    });
    throw new AppError('INVALID_CREDENTIALS', 'Invalid OTP code', 401);
  }

  // Mark OTP as used
  await prisma.oTPToken.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // For registration type — activate user and issue tokens
  if (type === 'registration') {
    const user = await prisma.user.update({
      where: { id: user_id },
      data: { is_active: true },
      include: {
        membership: { select: { id: true, status: true } },
      },
    });

    // Create default notification preferences
    await prisma.notificationPreference.create({
      data: { user_id: user.id },
    });

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User verified and activated', { userId: user.id });

    return {
      ...tokens,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        has_membership: !!user.membership,
      },
    };
  }

  // For password_reset type — just confirm OTP is valid
  return { verified: true, user_id };
}

// POST /auth/login — Ref: Primary Spec Section 7
export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      store: { select: { id: true, name: true } },
      membership: { select: { id: true, status: true } },
    },
  });

  if (!user || !user.is_active || user.deleted_at) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { last_login_at: new Date() },
  });

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    ...(user.role === 'cashier' && user.store_id ? { store_id: user.store_id } : {}),
  };

  const tokens = generateTokenPair(tokenPayload);

  const responseUser: Record<string, unknown> = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    has_membership: !!user.membership && user.membership.status === 'active',
  };

  // For cashier — include store info — Ref: Primary Spec Section 7
  if (user.role === 'cashier' && user.store) {
    responseUser.store_id = user.store.id;
    responseUser.store_name = user.store.name;
  }

  logger.info('User logged in', { userId: user.id, role: user.role });

  return {
    ...tokens,
    user: responseUser,
  };
}

// POST /auth/refresh — Ref: Primary Spec Section 7
export async function refreshAccessToken(input: RefreshInput) {
  const { refresh_token } = input;

  // Check blocklist
  const isBlocked = await redis.get(`blocklist:${refresh_token}`);
  if (isBlocked) {
    throw new AppError('TOKEN_INVALID', 'Refresh token has been revoked', 401);
  }

  const decoded = decodeRefreshToken(refresh_token);
  if (!decoded) {
    throw new AppError('TOKEN_INVALID', 'Invalid refresh token', 401);
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, store_id: true, is_active: true, deleted_at: true },
  });

  if (!user || !user.is_active || user.deleted_at) {
    throw new AppError('TOKEN_INVALID', 'User account is no longer active', 401);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    ...(user.store_id ? { store_id: user.store_id } : {}),
  };

  const { access_token } = generateTokenPair(tokenPayload);

  return { access_token };
}

// POST /auth/logout — Ref: Primary Spec Section 7
// Add refresh token to Redis blocklist with TTL matching token expiry
export async function logoutUser(refreshToken: string): Promise<void> {
  const ttl = getRefreshTokenTTL();
  await redis.set(`blocklist:${refreshToken}`, '1', 'EX', ttl);
  logger.info('User logged out, refresh token blocklisted');
}

// POST /auth/forgot-password — Ref: Primary Spec Section 7
// Always return success — never reveal if email exists
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const { email } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, phone: true },
  });

  if (user && user.phone) {
    const otpCode = generateOTP();
    await prisma.oTPToken.create({
      data: {
        user_id: user.id,
        phone_or_email: email,
        code: otpCode,
        type: 'password_reset',
        expires_at: getOTPExpiry(),
      },
    });
    await smsService.sendOTP(user.phone, otpCode);
    logger.info('Password reset OTP sent', { userId: user.id });
  }
  // Always succeed — never reveal if email exists
}

// POST /auth/reset-password — Ref: Primary Spec Section 7
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const { user_id, code, new_password } = input;

  // Verify OTP first
  await verifyOTP({ user_id, code, type: 'password_reset' });

  // Hash new password
  const password_hash = await bcrypt.hash(new_password, BCRYPT_COST_FACTOR);

  await prisma.user.update({
    where: { id: user_id },
    data: { password_hash },
  });

  logger.info('Password reset successful', { userId: user_id });
}

// POST /auth/change-password — Authenticated
export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const { current_password, new_password } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const passwordValid = await bcrypt.compare(current_password, user.password_hash);
  if (!passwordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 401);
  }

  const password_hash = await bcrypt.hash(new_password, BCRYPT_COST_FACTOR);

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash },
  });

  logger.info('Password changed successfully', { userId });
}
