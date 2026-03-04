// Transactions service tests — Ref: Primary Spec Section 12, Supplement Section 4
// Tests: online recording, partial discount, offline sync deduplication, error handling

import { recordTransaction, syncTransactions } from '../../../src/modules/transactions/transactions.service';
import { prisma } from '../../../src/config/database';
import { AppError } from '../../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
    prisma: {
        membership: { findUnique: jest.fn() },
        store: { findUnique: jest.fn() },
        transaction: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
        notification: { create: jest.fn() },
    },
}));

jest.mock('../../../src/config/env', () => ({
    env: {
        DISCOUNT_MIN_PCT: '1',
        DISCOUNT_MAX_PCT: '50',
    },
}));

jest.mock('../../../src/middleware/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../src/services/audit.service', () => ({
    createAuditLog: jest.fn(),
}));

describe('Transactions Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCashierId = 'cashier-001';
    const mockStoreId = '11111111-1111-1111-1111-111111111111';

    describe('recordTransaction', () => {
        const baseInput = {
            member_id: 'MUM-123456',
            store_id: mockStoreId,
            original_amount: 5000,
            discount_type: 'full' as const,
        };

        const mockMembership = { user_id: 'user-001', status: 'active' };
        const mockStore = { discount_pct: 15 };

        it('should record transaction with full discount', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(mockStore);
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-001',
                member_id: 'MUM-123456',
                original_amount: 5000,
                discount_pct: 15,
                discount_amount: 750,
                final_amount: 4250,
                discount_type: 'full',
                created_at: new Date(),
                store: { name: 'Mumuso Dolmen Mall' },
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            const result = await recordTransaction(baseInput, mockCashierId);

            expect(result.id).toBe('txn-001');
            expect(result.discount_pct).toBe(15);
            expect(result.discount_amount).toBe(750);
            expect(result.final_amount).toBe(4250);
            expect(result.store_name).toBe('Mumuso Dolmen Mall');
        });

        it('should record transaction with partial discount (50% of store rate)', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(mockStore); // 15%
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-002',
                member_id: 'MUM-123456',
                original_amount: 2000,
                discount_pct: 7.5, // 15% / 2
                discount_amount: 150,
                final_amount: 1850,
                discount_type: 'partial',
                created_at: new Date(),
                store: { name: 'Mumuso Dolmen Mall' },
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            const result = await recordTransaction(
                { ...baseInput, original_amount: 2000, discount_type: 'partial' },
                mockCashierId,
            );

            expect(result.id).toBe('txn-002');
            // Verify the create call used the halved discount
            const createCall = (prisma.transaction.create as jest.Mock).mock.calls[0][0];
            expect(createCall.data.discount_pct).toBe(7.5);
        });

        it('should reject inactive membership', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                user_id: 'user-001',
                status: 'expired',
            });

            await expect(
                recordTransaction(baseInput, mockCashierId),
            ).rejects.toThrow(AppError);

            await expect(
                recordTransaction(baseInput, mockCashierId),
            ).rejects.toMatchObject({
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            });
        });

        it('should reject when store discount is not configured', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                recordTransaction(baseInput, mockCashierId),
            ).rejects.toThrow(AppError);
        });

        it('should create notification for member after recording', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
            (prisma.store.findUnique as jest.Mock).mockResolvedValue(mockStore);
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-003',
                member_id: 'MUM-123456',
                original_amount: 1000,
                discount_pct: 15,
                discount_amount: 150,
                final_amount: 850,
                discount_type: 'full',
                created_at: new Date(),
                store: { name: 'Mumuso Test' },
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            await recordTransaction(baseInput, mockCashierId);

            expect(prisma.notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        user_id: 'user-001',
                        type: 'transaction_confirmed',
                    }),
                }),
            );
        });
    });

    describe('syncTransactions', () => {
        const makeOfflineTxn = (localId: string) => ({
            local_id: localId,
            member_id: 'MUM-123456',
            store_id: mockStoreId,
            original_amount: 3000,
            discount_type: 'full' as const,
            created_at: '2025-01-15T10:30:00Z',
        });

        it('should sync new offline transactions', async () => {
            // No duplicate found
            (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                user_id: 'user-001',
                status: 'active',
            });
            (prisma.store.findUnique as jest.Mock).mockResolvedValue({ discount_pct: 15 });
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-synced-001',
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            const result = await syncTransactions(
                { transactions: [makeOfflineTxn('local-001')] },
                mockCashierId,
            );

            expect(result.summary.total).toBe(1);
            expect(result.summary.created).toBe(1);
            expect(result.summary.duplicates).toBe(0);
            expect(result.summary.errors).toBe(0);
        });

        it('should deduplicate by local_id (skip existing)', async () => {
            // Duplicate found
            (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({
                id: 'txn-existing-001',
            });

            const result = await syncTransactions(
                { transactions: [makeOfflineTxn('local-dup')] },
                mockCashierId,
            );

            expect(result.summary.duplicates).toBe(1);
            expect(result.summary.created).toBe(0);
            expect(result.results[0].status).toBe('duplicate');
        });

        it('should handle per-transaction errors without failing the batch', async () => {
            // First txn: member not found (error)
            // Second txn: success
            (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null); // no dup
            (prisma.membership.findUnique as jest.Mock)
                .mockResolvedValueOnce(null) // first: member not found
                .mockResolvedValueOnce({ user_id: 'user-002', status: 'active' }); // second: found
            (prisma.store.findUnique as jest.Mock).mockResolvedValue({ discount_pct: 10 });
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-synced-002',
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            const result = await syncTransactions(
                {
                    transactions: [
                        makeOfflineTxn('local-err'),
                        makeOfflineTxn('local-ok'),
                    ],
                },
                mockCashierId,
            );

            expect(result.summary.total).toBe(2);
            expect(result.summary.errors).toBe(1);
            expect(result.summary.created).toBe(1);
            expect(result.results[0].status).toBe('error');
            expect(result.results[1].status).toBe('created');
        });

        it('should use device timestamp (created_at) from offline transaction', async () => {
            (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                user_id: 'user-001',
                status: 'active',
            });
            (prisma.store.findUnique as jest.Mock).mockResolvedValue({ discount_pct: 15 });
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'txn-synced-003',
            });
            (prisma.notification.create as jest.Mock).mockResolvedValue({});

            const deviceTimestamp = '2025-01-15T10:30:00Z';

            await syncTransactions(
                { transactions: [makeOfflineTxn('local-ts')] },
                mockCashierId,
            );

            const createCall = (prisma.transaction.create as jest.Mock).mock.calls[0][0];
            expect(createCall.data.created_at).toEqual(new Date(deviceTimestamp));
            expect(createCall.data.is_offline_sync).toBe(true);
        });
    });
});
