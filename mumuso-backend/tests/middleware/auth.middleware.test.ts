// Auth middleware tests
// Ref: Primary Spec Section 18

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, verifyRefreshToken } from '../../src/middleware/auth.middleware';
import { env } from '../../src/config/env';
import { redis } from '../../src/config/redis';

// Mock dependencies
jest.mock('../../src/config/redis', () => ({
  redis: {
    get: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TOKEN_INVALID',
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization format', () => {
      mockReq.headers = { authorization: 'InvalidFormat token' };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid JWT token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer' as const,
      };
      const token = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(
        expect.objectContaining({
          id: payload.id,
          email: payload.email,
          role: payload.role,
        })
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer' as const,
      };
      const token = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '-1s' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token with invalid signature', () => {
      const token = jwt.sign({ id: 'user-123' }, 'wrong-secret');
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TOKEN_INVALID',
          }),
        })
      );
    });

    it('should include store_id for cashier role', () => {
      const payload = {
        id: 'cashier-123',
        email: 'cashier@mumuso.com',
        role: 'cashier' as const,
        store_id: 'store-456',
      };
      const token = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(
        expect.objectContaining({
          store_id: 'store-456',
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer' as const,
      };
      const token = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await verifyRefreshToken(token);

      expect(result).toEqual(
        expect.objectContaining({
          id: payload.id,
          email: payload.email,
          role: payload.role,
        })
      );
    });

    it('should reject blocklisted token', async () => {
      const token = jwt.sign({ id: 'user-123' }, env.REFRESH_TOKEN_SECRET);
      (redis.get as jest.Mock).mockResolvedValue('1');

      const result = await verifyRefreshToken(token);

      expect(result).toBeNull();
    });

    it('should reject expired refresh token', async () => {
      const token = jwt.sign({ id: 'user-123' }, env.REFRESH_TOKEN_SECRET, { expiresIn: '-1s' });
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await verifyRefreshToken(token);

      expect(result).toBeNull();
    });

    it('should reject token with invalid signature', async () => {
      const token = jwt.sign({ id: 'user-123' }, 'wrong-secret');
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await verifyRefreshToken(token);

      expect(result).toBeNull();
    });
  });
});
