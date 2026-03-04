// Membership service tests — Ref: Primary Spec Section 9, 15
// Tests: plan listing, order creation, webhook processing, renewal info

import { listPlans, createOrder, processWebhook, getRenewalInfo } from '../../../src/modules/membership/membership.service';
import { prisma } from '../../../src/config/database';
import { safepayService } from '../../../src/services/safepay.service';
import { AppError } from '../../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
    prisma: {
        membershipPlan: { findMany: jest.fn(), findUnique: jest.fn() },
        membership: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
        user: { findUnique: jest.fn() },
        payment: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        notification: { create: jest.fn() },
        $transaction: jest.fn(),
    },
}));

jest.mock('../../../src/services/safepay.service', () => ({
    safepayService: {
        createOrder: jest.fn(),
    },
}));

jest.mock('../../../src/services/audit.service', () => ({
    createAuditLog: jest.fn(),
}));

jest.mock('../../../src/middleware/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../src/utils/memberId', () => ({
    generateMemberId: jest.fn().mockResolvedValue('MUM-NEW001'),
}));

describe('Membership Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listPlans', () => {
        it('should return all active plans sorted by price ascending', async () => {
            (prisma.membershipPlan.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'plan-1',
                    name: 'Standard',
                    price: { toString: () => '2500' },
                    currency: 'PKR',
                    duration_months: 12,
                    benefits: ['10% discount'],
                    is_active: true,
                },
                {
                    id: 'plan-2',
                    name: 'Premium',
                    price: { toString: () => '5000' },
                    currency: 'PKR',
                    duration_months: 12,
                    benefits: ['15% discount', 'Priority support'],
                    is_active: true,
                },
            ]);

            const result = await listPlans();

            expect(result.plans).toHaveLength(2);
            expect(result.plans[0].name).toBe('Standard');
            expect(result.plans[0].price).toBe(2500);
            expect(result.plans[1].name).toBe('Premium');
        });
    });

    describe('createOrder', () => {
        const userId = 'user-001';
        const planId = 'plan-1';

        it('should create order for user without existing membership', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.membershipPlan.findUnique as jest.Mock).mockResolvedValue({
                id: planId,
                price: { toString: () => '2500' },
                currency: 'PKR',
                is_active: true,
            });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                full_name: 'Ali Khan',
                email: 'ali@example.com',
                phone: '+923001234567',
            });
            (prisma.payment.create as jest.Mock).mockResolvedValue({
                id: 'pay-001',
            });
            (safepayService.createOrder as jest.Mock).mockResolvedValue({
                token: 'sfpy-token-001',
                expiry: '2025-01-15T12:00:00Z',
            });
            (prisma.payment.update as jest.Mock).mockResolvedValue({});

            const result = await createOrder(userId, { plan_id: planId });

            expect(result.payment_id).toBe('pay-001');
            expect(result.gateway_token).toBe('sfpy-token-001');
            expect(result.is_renewal).toBe(false);
        });

        it('should block order if active membership is more than 30 days from expiry', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                status: 'active',
                expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days out
            });

            await expect(
                createOrder(userId, { plan_id: planId }),
            ).rejects.toThrow(AppError);

            await expect(
                createOrder(userId, { plan_id: planId }),
            ).rejects.toMatchObject({
                code: 'ALREADY_EXISTS',
                statusCode: 409,
            });
        });

        it('should allow renewal within 30-day window', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                status: 'active',
                expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days out
            });
            (prisma.membershipPlan.findUnique as jest.Mock).mockResolvedValue({
                id: planId,
                price: { toString: () => '2500' },
                currency: 'PKR',
                is_active: true,
            });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                full_name: 'Ali Khan',
                email: 'ali@example.com',
                phone: '+923001234567',
            });
            (prisma.payment.create as jest.Mock).mockResolvedValue({
                id: 'pay-002',
            });
            (safepayService.createOrder as jest.Mock).mockResolvedValue({
                token: 'sfpy-renew-001',
                expiry: '2025-01-15T12:00:00Z',
            });
            (prisma.payment.update as jest.Mock).mockResolvedValue({});

            const result = await createOrder(userId, { plan_id: planId });

            expect(result.is_renewal).toBe(true);
        });
    });

    describe('processWebhook', () => {
        const basePayload = {
            event: 'payment.completed',
            data: {
                order_id: 'sfpy-order-001',
                payment_id: 'sfpy-pay-001',
                status: 'paid',
                amount: 2500,
                currency: 'PKR',
                payment_method: 'jazzcash',
            },
        };

        it('should ignore webhook for unknown order', async () => {
            (prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await processWebhook(basePayload);
            expect(result.processed).toBe(false);
            expect(result.reason).toBe('unknown_order');
        });

        it('should handle duplicate webhook idempotently', async () => {
            (prisma.payment.findFirst as jest.Mock).mockResolvedValue({
                id: 'pay-001',
                user_id: 'user-001',
                webhook_processed_at: new Date('2025-01-01'),
            });

            const result = await processWebhook(basePayload);
            expect(result.processed).toBe(true);
            expect(result.reason).toBe('duplicate');
        });

        it('should activate new membership on payment.completed', async () => {
            const mockPayment = {
                id: 'pay-001',
                user_id: 'user-001',
                plan_id: 'plan-1',
                is_renewal: false,
                amount: 2500,
                webhook_processed_at: null,
            };

            (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

            // Mock $transaction to execute the callback
            (prisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                await fn({
                    payment: { update: jest.fn() },
                    membership: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
                    notification: { create: jest.fn() },
                });
            });

            // Mock for audit log query
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                id: 'mem-001',
                member_id: 'MUM-NEW001',
            });

            const result = await processWebhook(basePayload);
            expect(result.processed).toBe(true);
            expect(result.reason).toBe('payment_completed');
        });

        it('should renew existing membership on payment.completed', async () => {
            const existingExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
            const mockPayment = {
                id: 'pay-002',
                user_id: 'user-001',
                plan_id: 'plan-1',
                is_renewal: true,
                amount: 2500,
                webhook_processed_at: null,
            };

            (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

            // Mock $transaction
            (prisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                const txMembershipUpdate = jest.fn();
                await fn({
                    payment: { update: jest.fn() },
                    membership: {
                        findUnique: jest.fn().mockResolvedValue({
                            id: 'mem-001',
                            member_id: 'MUM-123456',
                            expiry_date: existingExpiry,
                        }),
                        update: txMembershipUpdate,
                    },
                    notification: { create: jest.fn() },
                });

                // Verify renewal extends from current expiry + 365 days
                const updateCall = txMembershipUpdate.mock.calls[0][0];
                const newExpiry = updateCall.data.expiry_date;
                const expectedExpiry = new Date(existingExpiry);
                expectedExpiry.setDate(expectedExpiry.getDate() + 365);
                expect(newExpiry.toISOString()).toBe(expectedExpiry.toISOString());
            });

            // Mock for audit log query
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                id: 'mem-001',
                member_id: 'MUM-123456',
            });

            const result = await processWebhook(basePayload);
            expect(result.processed).toBe(true);
            expect(result.reason).toBe('payment_completed');
        });

        it('should handle payment.failed event', async () => {
            (prisma.payment.findFirst as jest.Mock).mockResolvedValue({
                id: 'pay-003',
                user_id: 'user-001',
                webhook_processed_at: null,
            });
            (prisma.payment.update as jest.Mock).mockResolvedValue({});

            const result = await processWebhook({
                event: 'payment.failed',
                data: { order_id: 'sfpy-order-002', status: 'failed' },
            });

            expect(result.processed).toBe(true);
            expect(result.reason).toBe('payment_failed');
        });
    });

    describe('getRenewalInfo', () => {
        it('should return renewal info for active membership', async () => {
            const expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue({
                status: 'active',
                expiry_date: expiryDate,
                plan_id: 'plan-1',
            });
            (prisma.membershipPlan.findUnique as jest.Mock).mockResolvedValue({
                name: 'Standard',
                price: { toString: () => '2500' },
                currency: 'PKR',
                duration_months: 12,
            });

            const result = await getRenewalInfo('user-001');

            expect(result.current_expiry).toEqual(expiryDate);
            expect(result.membership_status).toBe('active');
            expect(result.plan).not.toBeNull();
            expect(result.plan!.name).toBe('Standard');
            // New expiry should be 365 days from current expiry (since still active)
            const expectedNewExpiry = new Date(expiryDate);
            expectedNewExpiry.setDate(expectedNewExpiry.getDate() + 365);
            expect(result.new_expiry_if_renewed_today.toDateString()).toBe(
                expectedNewExpiry.toDateString(),
            );
        });

        it('should throw NOT_FOUND if user has no membership', async () => {
            (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(getRenewalInfo('user-999')).rejects.toThrow(AppError);
            await expect(getRenewalInfo('user-999')).rejects.toMatchObject({
                code: 'NOT_FOUND',
                statusCode: 404,
            });
        });
    });
});
