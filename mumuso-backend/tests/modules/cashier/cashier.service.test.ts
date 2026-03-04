// Cashier service tests — Ref: Primary Spec Section 11, 17
// Tests all 6+ transaction scenarios for /cashier/validate

import { validateMember, getStoreConfig } from '../../../src/modules/cashier/cashier.service';
import { prisma } from '../../../src/config/database';
import { verifyQRToken } from '../../../src/utils/qrToken';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
    prisma: {
        membership: { findUnique: jest.fn() },
        store: { findUnique: jest.fn() },
    },
}));

jest.mock('../../../src/utils/qrToken', () => ({
    verifyQRToken: jest.fn(),
}));

jest.mock('../../../src/middleware/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Cashier Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCashierId = 'cashier-001';
    const mockStoreId = '11111111-1111-1111-1111-111111111111';

    const activeStore = {
        id: mockStoreId,
        name: 'Mumuso Dolmen Mall',
        discount_pct: 15,
        is_active: true,
    };

    const activeMembership = {
        member_id: 'MUM-123456',
        status: 'active',
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        user: { id: 'user-001', full_name: 'Ali Khan' },
    };

    describe('validateMember', () => {
        // ─── Scenario 1: Valid member, QR scan ──────────────────────────────
        it('Scenario 1: should validate valid member via QR scan', async () => {
            (verifyQRToken as jest.Mock).mockReturnValue({
                valid: true,
                memberId: 'MUM-123456',
            });
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(activeMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(activeStore);

            const result = await validateMember(
                { qr_token: 'valid-token', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(true);
            expect(result.member_name).toBe('Ali Khan');
            expect(result.discount_pct).toBe(15);
            expect(result.manual_entry).toBe(false);
            expect(result.validation?.method).toBe('qr_scan');
        });

        // ─── Scenario 2: Valid member, manual ID ────────────────────────────
        it('Scenario 2: should validate valid member via manual ID', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(activeMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(activeStore);

            const result = await validateMember(
                { member_id: 'MUM-123456', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(true);
            expect(result.manual_entry).toBe(true);
            expect(result.discount_pct).toBe(15);
            expect(result.validation?.method).toBe('manual_entry');
        });

        // ─── Scenario 3: Membership expired ─────────────────────────────────
        it('Scenario 3: should reject expired membership', async () => {
            const expiredMembership = {
                ...activeMembership,
                status: 'expired',
                expiry_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            };
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(expiredMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(activeStore);

            const result = await validateMember(
                { member_id: 'MUM-123456', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('expired');
            expect(result.renewal_prompt).toBe(true);
        });

        // ─── Scenario 4: Member not found ───────────────────────────────────
        it('Scenario 4: should return not_found for unknown member', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await validateMember(
                { member_id: 'MUM-UNKNOWN', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('not_found');
        });

        // ─── Scenario 5: Suspended member ───────────────────────────────────
        it('Scenario 5: should reject suspended member', async () => {
            const suspendedMembership = {
                ...activeMembership,
                status: 'suspended',
            };
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(suspendedMembership);

            const result = await validateMember(
                { member_id: 'MUM-123456', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('suspended');
        });

        // ─── Invalid QR token ───────────────────────────────────────────────
        it('should reject invalid QR token', async () => {
            (verifyQRToken as jest.Mock).mockReturnValue({
                valid: false,
                reason: 'invalid_signature',
            });

            const result = await validateMember(
                { qr_token: 'invalid-token', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('invalid_token');
        });

        it('should reject expired QR token specifically', async () => {
            (verifyQRToken as jest.Mock).mockReturnValue({
                valid: false,
                reason: 'token_expired',
            });

            const result = await validateMember(
                { qr_token: 'expired-token', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('token_expired');
        });

        // ─── Store not configured ───────────────────────────────────────────
        it('should reject if store is not configured', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(activeMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await validateMember(
                { member_id: 'MUM-123456', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('store_error');
        });

        // ─── No input provided ──────────────────────────────────────────────
        it('should reject if no QR token or member ID provided', async () => {
            const result = await validateMember(
                { store_id: mockStoreId } as any,
                mockCashierId,
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('invalid_input');
        });

        // ─── Expiry warnings ────────────────────────────────────────────────
        it('should include warning if membership expires within 7 days', async () => {
            const nearExpiryMembership = {
                ...activeMembership,
                expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            };
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(nearExpiryMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(activeStore);

            const result = await validateMember(
                { member_id: 'MUM-123456', store_id: mockStoreId },
                mockCashierId,
            );

            expect(result.valid).toBe(true);
            expect(result.warnings).toContain('membership_expires_in_7_days');
        });
    });

    describe('getStoreConfig', () => {
        it('should return store config for valid store', async () => {
            (prisma.store.findUnique as jest.Mock).mockResolvedValue({
                id: mockStoreId,
                name: 'Mumuso Dolmen Mall',
                discount_pct: 15,
                updated_at: new Date('2025-01-01'),
            });

            const result = await getStoreConfig(mockStoreId);

            expect(result).not.toBeNull();
            expect(result!.store_name).toBe('Mumuso Dolmen Mall');
            expect(result!.discount_pct).toBe(15);
        });

        it('should return null for unknown store', async () => {
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await getStoreConfig('unknown-id');
            expect(result).toBeNull();
        });
    });
});
