// Auth service tests
// Ref: Primary Spec Section 7

import bcrypt from 'bcrypt';
import { registerUser, loginUser, verifyOTP } from '../../../src/modules/auth/auth.service';
import { prisma } from '../../../src/config/database';
import { smsService } from '../../../src/services/sms.service';
import { AppError } from '../../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    oTPToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    notificationPreference: {
      create: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../../src/services/sms.service', () => ({
  smsService: {
    sendOTP: jest.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const validInput = {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+923001234567',
      password: 'Password123',
      confirm_password: 'Password123',
    };

    it('should create user and send OTP', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        ...validInput,
        password_hash: 'hashed',
      });
      (prisma.oTPToken.create as jest.Mock).mockResolvedValue({});
      (smsService.sendOTP as jest.Mock).mockResolvedValue(undefined);

      const result = await registerUser(validInput);

      expect(result).toEqual({ user_id: 'user-123' });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            full_name: validInput.full_name,
            email: validInput.email,
            phone: validInput.phone,
            role: 'customer',
            is_active: false,
          }),
        })
      );
      expect(smsService.sendOTP).toHaveBeenCalledWith(
        validInput.phone,
        expect.any(String)
      );
    });

    it('should reject duplicate email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: validInput.email,
        deleted_at: null,
      });

      await expect(registerUser(validInput)).rejects.toThrow(AppError);
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'ALREADY_EXISTS',
        statusCode: 409,
      });
    });

    it('should enforce 90-day re-registration block for soft-deleted users', async () => {
      const recentlyDeleted = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'deleted-user',
        email: validInput.email,
        deleted_at: recentlyDeleted,
      });

      await expect(registerUser(validInput)).rejects.toThrow(AppError);
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'ALREADY_EXISTS',
        statusCode: 409,
      });
    });

    it('should hash password with bcrypt cost factor 12', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockImplementation(async ({ data }) => ({
        id: 'user-123',
        ...data,
      }));
      (prisma.oTPToken.create as jest.Mock).mockResolvedValue({});
      (smsService.sendOTP as jest.Mock).mockResolvedValue(undefined);

      await registerUser(validInput);

      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      const passwordHash = createCall.data.password_hash;

      // Verify bcrypt hash format
      expect(passwordHash).toMatch(/^\$2[aby]\$12\$/);
      
      // Verify password can be compared
      const isValid = await bcrypt.compare(validInput.password, passwordHash);
      expect(isValid).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    const validInput = {
      user_id: 'user-123',
      code: '123456',
      type: 'registration' as const,
    };

    it('should verify valid OTP and activate user', async () => {
      (prisma.oTPToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'otp-123',
        code: '123456',
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        used: false,
      });
      (prisma.oTPToken.update as jest.Mock).mockResolvedValue({});
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      });
      (prisma.notificationPreference.create as jest.Mock).mockResolvedValue({});
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await verifyOTP(validInput);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      if ('user' in result) {
        expect(result.user).toEqual(
          expect.objectContaining({
            id: 'user-123',
            has_membership: false,
          })
        );
      }
    });

    it('should reject expired OTP', async () => {
      (prisma.oTPToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'otp-123',
        code: '123456',
        expires_at: new Date(Date.now() - 1000),
        attempts: 0,
        used: false,
      });

      await expect(verifyOTP(validInput)).rejects.toThrow(AppError);
      await expect(verifyOTP(validInput)).rejects.toMatchObject({
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      });
    });

    it('should reject incorrect OTP code', async () => {
      (prisma.oTPToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'otp-123',
        code: '654321',
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        used: false,
      });
      (prisma.oTPToken.update as jest.Mock).mockResolvedValue({});

      await expect(verifyOTP(validInput)).rejects.toThrow(AppError);
      await expect(verifyOTP(validInput)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
      
      expect(prisma.oTPToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attempts: { increment: 1 },
          }),
        })
      );
    });

    it('should lock OTP after 3 failed attempts', async () => {
      (prisma.oTPToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'otp-123',
        code: '654321',
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 2,
        used: false,
      });
      (prisma.oTPToken.update as jest.Mock).mockResolvedValue({});

      await expect(verifyOTP(validInput)).rejects.toThrow(AppError);

      expect(prisma.oTPToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attempts: { increment: 1 },
            expires_at: new Date(0),
          }),
        })
      );
    });

    it('should reject already locked OTP', async () => {
      (prisma.oTPToken.findFirst as jest.Mock).mockResolvedValue({
        id: 'otp-123',
        code: '123456',
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 3,
        used: false,
      });

      await expect(verifyOTP(validInput)).rejects.toThrow(AppError);
      await expect(verifyOTP(validInput)).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        statusCode: 429,
      });
    });
  });

  describe('loginUser', () => {
    const validInput = {
      email: 'john@example.com',
      password: 'Password123',
    };

    it('should login user with valid credentials', async () => {
      const passwordHash = await bcrypt.hash(validInput.password, 12);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        full_name: 'John Doe',
        email: validInput.email,
        password_hash: passwordHash,
        role: 'customer',
        is_active: true,
        deleted_at: null,
        membership: { id: 'mem-123', status: 'active' },
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await loginUser(validInput);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: validInput.email,
          has_membership: true,
        })
      );
    });

    it('should reject invalid password', async () => {
      const passwordHash = await bcrypt.hash('DifferentPassword123', 12);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: validInput.email,
        password_hash: passwordHash,
        is_active: true,
        deleted_at: null,
      });

      await expect(loginUser(validInput)).rejects.toThrow(AppError);
      await expect(loginUser(validInput)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });

    it('should reject inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: validInput.email,
        is_active: false,
        deleted_at: null,
      });

      await expect(loginUser(validInput)).rejects.toThrow(AppError);
    });

    it('should reject soft-deleted user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: validInput.email,
        is_active: true,
        deleted_at: new Date(),
      });

      await expect(loginUser(validInput)).rejects.toThrow(AppError);
    });
  });
});
