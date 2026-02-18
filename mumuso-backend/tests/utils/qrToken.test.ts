// QR Token generation and verification tests
// Ref: Primary Spec Section 14, Supplement Section 3.1-3.2

import { generateQRToken, verifyQRToken } from '../../src/utils/qrToken';

describe('QR Token Utils', () => {
  const mockMemberId = 'MUM-123456';

  describe('generateQRToken', () => {
    it('should generate a valid base64 token', () => {
      const token = generateQRToken(mockMemberId);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      // Should be valid base64
      expect(() => Buffer.from(token, 'base64')).not.toThrow();
    });

    it('should include member ID in token payload', () => {
      const token = generateQRToken(mockMemberId);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      expect(decoded.memberId).toBe(mockMemberId);
      expect(decoded.issuedAt).toBeDefined();
      expect(decoded.expiresAt).toBeDefined();
      expect(decoded.signature).toBeDefined();
    });

    it('should set expiry to 5 minutes from now', () => {
      const token = generateQRToken(mockMemberId);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      const expectedExpiry = Math.floor(Date.now() / 1000) + 300;
      expect(decoded.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 2);
      expect(decoded.expiresAt).toBeLessThanOrEqual(expectedExpiry + 2);
    });
  });

  describe('verifyQRToken', () => {
    it('should verify a valid token', () => {
      const token = generateQRToken(mockMemberId);
      const result = verifyQRToken(token);
      
      expect(result.valid).toBe(true);
      expect(result.memberId).toBe(mockMemberId);
      expect(result.reason).toBeUndefined();
    });

    it('should reject expired token', () => {
      // Create token with past expiry
      const payload = {
        memberId: mockMemberId,
        issuedAt: Math.floor(Date.now() / 1000) - 400,
        expiresAt: Math.floor(Date.now() / 1000) - 100,
        signature: 'invalid',
      };
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      const result = verifyQRToken(token);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('token_expired');
    });

    it('should reject token with invalid signature', () => {
      const token = generateQRToken(mockMemberId);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      // Tamper with signature
      decoded.signature = 'tampered_signature';
      const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64');
      
      const result = verifyQRToken(tamperedToken);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('invalid_signature');
    });

    it('should reject malformed token', () => {
      const result = verifyQRToken('not-a-valid-token');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('malformed_token');
    });

    it('should reject token with missing fields', () => {
      const payload = { memberId: mockMemberId };
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      const result = verifyQRToken(token);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('malformed_token');
    });

    it('should accept token within clock skew tolerance (60s)', () => {
      // Create token that expired 30 seconds ago (within 60s tolerance)
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        memberId: mockMemberId,
        issuedAt: now - 330,
        expiresAt: now - 30,
      };
      
      // Generate proper signature
      const crypto = require('crypto');
      const { env } = require('../../src/config/env');
      const signature = crypto
        .createHmac('sha256', env.QR_SECRET)
        .update(JSON.stringify({ memberId: payload.memberId, issuedAt: payload.issuedAt, expiresAt: payload.expiresAt }))
        .digest('hex');
      
      const fullPayload = { ...payload, signature };
      const token = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
      
      const result = verifyQRToken(token);
      expect(result.valid).toBe(true);
    });
  });
});
