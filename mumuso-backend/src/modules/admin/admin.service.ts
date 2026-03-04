// Admin service — business logic for admin dashboard — Ref: Law 3.1 (Modularity)
// Handles: dashboard stats, member management, transaction analytics, store CRUD, reports

import { Decimal } from 'decimal.js';
import moment from 'moment-timezone';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';
import { parsePaginationParams, buildPaginationResult, getSkip } from '../../utils/pagination';
import { createAuditLog } from '../../services/audit.service';
import {
  DashboardStatsQueryInput,
  ListMembersQueryInput,
  ListTransactionsQueryInput,
  CreateStoreInput,
  UpdateStoreInput,
  ExportReportQueryInput,
  UpdateMemberStatusInput,
} from './admin.schema';

// ─── GET /admin/dashboard — Ref: Law 4.1 (Metrics: RED pattern) ────────────
export async function getDashboardStats(query: DashboardStatsQueryInput) {
  const { period } = query;

  // Calculate date range based on period
  const now = moment.tz('Asia/Karachi');
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = now.clone().startOf('day').toDate();
      break;
    case 'week':
      startDate = now.clone().subtract(7, 'days').startOf('day').toDate();
      break;
    case 'month':
      startDate = now.clone().startOf('month').toDate();
      break;
    case 'year':
      startDate = now.clone().startOf('year').toDate();
      break;
    case 'all':
    default:
      startDate = new Date(0); // Unix epoch
  }

  // Parallel queries for performance — Ref: Law 6.1 (Latency budgets)
  const [
    totalMembers,
    activeMembers,
    expiredMembers,
    suspendedMembers,
    totalTransactions,
    periodTransactions,
    totalRevenue,
    periodRevenue,
    totalStores,
    activeStores,
    recentTransactions,
    topStores,
    membershipTrend,
  ] = await Promise.all([
    // Member statistics
    prisma.membership.count(),
    prisma.membership.count({ where: { status: 'active' } }),
    prisma.membership.count({ where: { status: 'expired' } }),
    prisma.membership.count({ where: { status: 'suspended' } }),

    // Transaction statistics (all time)
    prisma.transaction.count(),
    prisma.transaction.count({ where: { created_at: { gte: startDate } } }),

    // Revenue statistics (all time) — Ref: Law 2.3 (Decimal.js for precision)
    prisma.transaction.findMany({ select: { discount_amount: true } }),
    prisma.transaction.findMany({
      where: { created_at: { gte: startDate } },
      select: { discount_amount: true },
    }),

    // Store statistics
    prisma.store.count(),
    prisma.store.count({ where: { is_active: true } }),

    // Recent activity
    prisma.transaction.findMany({
      where: { created_at: { gte: startDate } },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        user: { select: { full_name: true } },
        store: { select: { name: true } },
      },
    }),

    // Top performing stores by transaction count
    prisma.transaction.groupBy({
      by: ['store_id'],
      where: { created_at: { gte: startDate } },
      _count: { id: true },
      _sum: { discount_amount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),

    // Membership trend (last 12 months)
    prisma.membership.groupBy({
      by: ['activated_at'],
      where: {
        activated_at: {
          gte: moment.tz('Asia/Karachi').subtract(12, 'months').toDate(),
        },
      },
      _count: { id: true },
    }),
  ]);

  // Calculate total revenue saved — Ref: Authorization Decision B
  const totalRevenueSaved = totalRevenue.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  const periodRevenueSaved = periodRevenue.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  // Fetch store details for top stores
  const topStoreIds = topStores.map((s) => s.store_id);
  const storeDetails = await prisma.store.findMany({
    where: { id: { in: topStoreIds } },
    select: { id: true, name: true, city: true },
  });

  const topStoresWithDetails = topStores.map((stat) => {
    const store = storeDetails.find((s) => s.id === stat.store_id);
    return {
      store_id: stat.store_id,
      store_name: store?.name ?? 'Unknown',
      city: store?.city ?? 'Unknown',
      transaction_count: stat._count.id,
      total_discount: stat._sum.discount_amount ? Number(stat._sum.discount_amount) : 0,
    };
  });

  // Calculate growth rates
  const previousPeriodStart = moment.tz('Asia/Karachi')
    .subtract(period === 'today' ? 1 : period === 'week' ? 14 : period === 'month' ? 2 : 2, period === 'today' ? 'days' : period === 'week' ? 'days' : 'months')
    .toDate();

  const previousPeriodTransactions = await prisma.transaction.count({
    where: {
      created_at: {
        gte: previousPeriodStart,
        lt: startDate,
      },
    },
  });

  const transactionGrowth = previousPeriodTransactions > 0
    ? ((periodTransactions - previousPeriodTransactions) / previousPeriodTransactions) * 100
    : 0;

  logger.info('Dashboard stats retrieved', { period, adminRequest: true });

  return {
    period,
    overview: {
      total_members: totalMembers,
      active_members: activeMembers,
      expired_members: expiredMembers,
      suspended_members: suspendedMembers,
      total_transactions: totalTransactions,
      period_transactions: periodTransactions,
      total_revenue_saved: totalRevenueSaved.toNumber(),
      period_revenue_saved: periodRevenueSaved.toNumber(),
      total_stores: totalStores,
      active_stores: activeStores,
      transaction_growth_pct: Number(transactionGrowth.toFixed(2)),
    },
    recent_transactions: recentTransactions.map((t) => ({
      id: t.id,
      member_name: t.user.full_name,
      store_name: t.store.name,
      discount_amount: Number(t.discount_amount),
      final_amount: Number(t.final_amount),
      created_at: t.created_at,
    })),
    top_stores: topStoresWithDetails,
    membership_trend: membershipTrend.map((m) => ({
      month: moment(m.activated_at).format('YYYY-MM'),
      count: m._count.id,
    })),
  };
}

// ─── GET /admin/members — Ref: Law 3.3 (Pagination for scalability) ────────
export async function listMembers(query: ListMembersQueryInput) {
  const { page, limit } = parsePaginationParams(query);
  const skip = getSkip(page, limit);

  // Build where clause
  const where: Record<string, unknown> = {};

  if (query.status && query.status !== 'all') {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { member_id: { contains: query.search, mode: 'insensitive' } },
      { user: { full_name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  // Build order by
  let orderBy: Record<string, unknown> = { created_at: query.sort_order ?? 'desc' };

  if (query.sort_by === 'expiry_date') {
    orderBy = { expiry_date: query.sort_order ?? 'desc' };
  } else if (query.sort_by === 'name') {
    orderBy = { user: { full_name: query.sort_order ?? 'asc' } };
  }

  const [members, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            created_at: true,
          },
        },
        plan: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    }),
    prisma.membership.count({ where }),
  ]);

  // Get transaction counts and total saved for each member
  const memberIds = members.map((m) => m.member_id);
  const transactionStats = await prisma.transaction.groupBy({
    by: ['member_id'],
    where: { member_id: { in: memberIds } },
    _count: { id: true },
    _sum: { discount_amount: true },
  });

  const membersWithStats = members.map((member) => {
    const stats = transactionStats.find((s) => s.member_id === member.member_id);
    const daysRemaining = moment(member.expiry_date).diff(moment(), 'days');

    return {
      id: member.id,
      member_id: member.member_id,
      user: {
        id: member.user.id,
        full_name: member.user.full_name,
        email: member.user.email,
        phone: member.user.phone,
        joined_at: member.user.created_at,
      },
      status: member.status,
      plan_name: member.plan?.name ?? 'Unknown',
      plan_price: member.plan ? Number(member.plan.price) : 0,
      activated_at: member.activated_at,
      expiry_date: member.expiry_date,
      days_remaining: Math.max(0, daysRemaining),
      transaction_count: stats?._count.id ?? 0,
      total_saved: stats?._sum.discount_amount ? Number(stats._sum.discount_amount) : 0,
    };
  });

  return {
    members: membersWithStats,
    pagination: buildPaginationResult(page, limit, total),
  };
}

// ─── GET /admin/members/:id — Ref: Law 9.1 (User journey validation) ───────
export async function getMemberDetails(memberId: string) {
  const membership = await prisma.membership.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          created_at: true,
          last_login_at: true,
        },
      },
      plan: true,
    },
  });

  if (!membership) {
    throw new AppError('NOT_FOUND', 'Member not found', 404);
  }

  // Get transaction history
  const transactions = await prisma.transaction.findMany({
    where: { member_id: membership.member_id },
    orderBy: { created_at: 'desc' },
    take: 50,
    include: {
      store: { select: { name: true, city: true } },
    },
  });

  // Calculate statistics
  const totalSaved = transactions.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  const avgTransactionValue = transactions.length > 0
    ? totalSaved.dividedBy(transactions.length)
    : new Decimal(0);

  // Payment history
  const payments = await prisma.payment.findMany({
    where: { user_id: membership.user_id },
    orderBy: { created_at: 'desc' },
    include: {
      plan: { select: { name: true } },
    },
  });

  // Device tokens
  const devices = await prisma.deviceToken.findMany({
    where: { user_id: membership.user_id, is_active: true },
    select: { platform: true, created_at: true },
  });

  return {
    member: {
      id: membership.id,
      member_id: membership.member_id,
      status: membership.status,
      activated_at: membership.activated_at,
      expiry_date: membership.expiry_date,
      days_remaining: Math.max(0, moment(membership.expiry_date).diff(moment(), 'days')),
    },
    user: {
      id: membership.user.id,
      full_name: membership.user.full_name,
      email: membership.user.email,
      phone: membership.user.phone,
      joined_at: membership.user.created_at,
      last_login: membership.user.last_login_at,
    },
    plan: membership.plan ? {
      name: membership.plan.name,
      price: Number(membership.plan.price),
      duration_months: membership.plan.duration_months,
    } : null,
    statistics: {
      total_transactions: transactions.length,
      total_saved: totalSaved.toNumber(),
      avg_transaction_value: avgTransactionValue.toNumber(),
      favorite_store: transactions[0]?.store.name ?? null,
      last_transaction_date: transactions[0]?.created_at ?? null,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      store_name: t.store.name,
      store_city: t.store.city,
      date: t.created_at,
      original_amount: Number(t.original_amount),
      discount_amount: Number(t.discount_amount),
      final_amount: Number(t.final_amount),
      discount_type: t.discount_type,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      plan_name: p.plan?.name ?? 'Unknown',
      amount: Number(p.amount),
      status: p.status,
      gateway: p.gateway,
      created_at: p.created_at,
    })),
    devices: devices.map((d) => ({
      platform: d.platform,
      registered_at: d.created_at,
    })),
  };
}

// ─── GET /admin/transactions — Ref: Law 6.2 (Resource constraints) ─────────
export async function listTransactions(query: ListTransactionsQueryInput) {
  const { page, limit } = parsePaginationParams(query);
  const skip = getSkip(page, limit);

  // Build where clause with filters
  const where: Record<string, unknown> = {};

  if (query.store_id) {
    where.store_id = query.store_id;
  }

  if (query.member_id) {
    where.member_id = query.member_id;
  }

  if (query.discount_type && query.discount_type !== 'all') {
    where.discount_type = query.discount_type;
  }

  if (query.from_date || query.to_date) {
    where.created_at = {
      ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
      ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
    };
  }

  if (query.min_amount || query.max_amount) {
    where.final_amount = {
      ...(query.min_amount ? { gte: parseFloat(query.min_amount) } : {}),
      ...(query.max_amount ? { lte: parseFloat(query.max_amount) } : {}),
    };
  }

  // Build order by
  const orderBy: Record<string, string> = {};
  const sortBy = query.sort_by ?? 'created_at';
  orderBy[sortBy] = query.sort_order ?? 'desc';

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { full_name: true } },
        store: { select: { name: true, city: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Calculate summary statistics
  const allTransactions = await prisma.transaction.findMany({
    where,
    select: { discount_amount: true, final_amount: true, original_amount: true },
  });

  const summary = {
    total_transactions: total,
    total_discount: allTransactions.reduce(
      (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
      new Decimal(0),
    ).toNumber(),
    total_revenue: allTransactions.reduce(
      (sum, t) => sum.plus(new Decimal(t.final_amount.toString())),
      new Decimal(0),
    ).toNumber(),
    total_original: allTransactions.reduce(
      (sum, t) => sum.plus(new Decimal(t.original_amount.toString())),
      new Decimal(0),
    ).toNumber(),
  };

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      member_id: t.member_id,
      member_name: t.user.full_name,
      store_name: t.store.name,
      store_city: t.store.city,
      date: t.created_at,
      original_amount: Number(t.original_amount),
      discount_pct: Number(t.discount_pct),
      discount_amount: Number(t.discount_amount),
      final_amount: Number(t.final_amount),
      discount_type: t.discount_type,
      is_offline_sync: t.is_offline_sync,
    })),
    summary,
    pagination: buildPaginationResult(page, limit, total),
  };
}

// ─── GET /admin/stores — List all stores ────────────────────────────────────
export async function listStores() {
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' },
  });

  // Get transaction counts per store
  const storeIds = stores.map((s) => s.id);
  const transactionCounts = await prisma.transaction.groupBy({
    by: ['store_id'],
    where: { store_id: { in: storeIds } },
    _count: { id: true },
    _sum: { discount_amount: true },
  });

  return {
    stores: stores.map((store) => {
      const stats = transactionCounts.find((s) => s.store_id === store.id);
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        country: store.country,
        phone: store.phone,
        latitude: store.latitude ? Number(store.latitude) : null,
        longitude: store.longitude ? Number(store.longitude) : null,
        discount_pct: store.discount_pct ? Number(store.discount_pct) : null,
        operating_hours: store.operating_hours,
        is_active: store.is_active,
        transaction_count: stats?._count.id ?? 0,
        total_discount_given: stats?._sum.discount_amount ? Number(stats._sum.discount_amount) : 0,
        created_at: store.created_at,
        updated_at: store.updated_at,
      };
    }),
  };
}

// ─── POST /admin/stores — Create new store ─────────────────────────────────
export async function createStore(input: CreateStoreInput, adminId: string) {
  const store = await prisma.store.create({
    data: {
      name: input.name,
      address: input.address,
      city: input.city,
      country: input.country ?? 'Pakistan',
      phone: input.phone,
      latitude: input.latitude,
      longitude: input.longitude,
      discount_pct: input.discount_pct,
      operating_hours: input.operating_hours ?? {},
      is_active: input.is_active ?? true,
    },
  });

  // Audit log — Ref: Primary Spec Section 6
  await createAuditLog({
    actorId: adminId,
    action: 'STORE_CREATED',
    targetType: 'store',
    targetId: store.id,
    newValue: {
      name: store.name,
      city: store.city,
      discount_pct: Number(store.discount_pct),
    },
  });

  logger.info('Store created by admin', { storeId: store.id, adminId });

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    city: store.city,
    discount_pct: Number(store.discount_pct),
    is_active: store.is_active,
  };
}

// ─── PUT /admin/stores/:id — Update store ──────────────────────────────────
export async function updateStore(storeId: string, input: UpdateStoreInput, adminId: string) {
  const existingStore = await prisma.store.findUnique({ where: { id: storeId } });

  if (!existingStore) {
    throw new AppError('NOT_FOUND', 'Store not found', 404);
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.country ? { country: input.country } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.discount_pct !== undefined ? { discount_pct: input.discount_pct } : {}),
      ...(input.operating_hours ? { operating_hours: input.operating_hours } : {}),
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    },
  });

  // Audit log
  await createAuditLog({
    actorId: adminId,
    action: 'STORE_UPDATED',
    targetType: 'store',
    targetId: store.id,
    oldValue: {
      name: existingStore.name,
      discount_pct: existingStore.discount_pct ? Number(existingStore.discount_pct) : null,
      is_active: existingStore.is_active,
    },
    newValue: {
      name: store.name,
      discount_pct: store.discount_pct ? Number(store.discount_pct) : null,
      is_active: store.is_active,
    },
  });

  logger.info('Store updated by admin', { storeId: store.id, adminId });

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    city: store.city,
    discount_pct: store.discount_pct ? Number(store.discount_pct) : null,
    is_active: store.is_active,
  };
}

// ─── GET /admin/reports/export — Export data ───────────────────────────────
export async function exportReport(query: ExportReportQueryInput) {
  const { report_type, format, from_date, to_date, store_id } = query;

  let data: unknown[] = [];
  let filename = '';

  const dateFilter = from_date || to_date ? {
    created_at: {
      ...(from_date ? { gte: new Date(from_date) } : {}),
      ...(to_date ? { lte: new Date(to_date) } : {}),
    },
  } : {};

  switch (report_type) {
    case 'members': {
      const members = await prisma.membership.findMany({
        include: {
          user: { select: { full_name: true, email: true, phone: true } },
          plan: { select: { name: true, price: true } },
        },
      });

      data = members.map((m) => ({
        member_id: m.member_id,
        name: m.user.full_name,
        email: m.user.email,
        phone: m.user.phone,
        status: m.status,
        plan: m.plan?.name ?? 'Unknown',
        plan_price: m.plan ? Number(m.plan.price) : 0,
        activated_at: m.activated_at,
        expiry_date: m.expiry_date,
      }));
      filename = `members_${moment().format('YYYY-MM-DD')}.${format}`;
      break;
    }

    case 'transactions': {
      const where = {
        ...dateFilter,
        ...(store_id ? { store_id } : {}),
      };

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          user: { select: { full_name: true } },
          store: { select: { name: true, city: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      data = transactions.map((t) => ({
        transaction_id: t.id,
        member_id: t.member_id,
        member_name: t.user.full_name,
        store_name: t.store.name,
        store_city: t.store.city,
        date: moment(t.created_at).format('YYYY-MM-DD HH:mm:ss'),
        original_amount: Number(t.original_amount),
        discount_pct: Number(t.discount_pct),
        discount_amount: Number(t.discount_amount),
        final_amount: Number(t.final_amount),
        discount_type: t.discount_type,
        is_offline: t.is_offline_sync,
      }));
      filename = `transactions_${moment().format('YYYY-MM-DD')}.${format}`;
      break;
    }

    case 'revenue': {
      const transactions = await prisma.transaction.findMany({
        where: dateFilter,
        select: {
          created_at: true,
          discount_amount: true,
          final_amount: true,
          original_amount: true,
        },
      });

      // Group by date
      const revenueByDate = transactions.reduce((acc, t) => {
        const date = moment(t.created_at).format('YYYY-MM-DD');
        if (!acc[date]) {
          acc[date] = {
            date,
            transaction_count: 0,
            total_discount: 0,
            total_revenue: 0,
            total_original: 0,
          };
        }
        acc[date].transaction_count++;
        acc[date].total_discount += Number(t.discount_amount);
        acc[date].total_revenue += Number(t.final_amount);
        acc[date].total_original += Number(t.original_amount);
        return acc;
      }, {} as Record<string, unknown>);

      data = Object.values(revenueByDate);
      filename = `revenue_${moment().format('YYYY-MM-DD')}.${format}`;
      break;
    }

    case 'stores': {
      const stores = await prisma.store.findMany();
      const storeIds = stores.map((s) => s.id);
      const stats = await prisma.transaction.groupBy({
        by: ['store_id'],
        where: { store_id: { in: storeIds } },
        _count: { id: true },
        _sum: { discount_amount: true },
      });

      data = stores.map((s) => {
        const storeStat = stats.find((st) => st.store_id === s.id);
        return {
          store_id: s.id,
          name: s.name,
          city: s.city,
          address: s.address,
          phone: s.phone,
          discount_pct: s.discount_pct ? Number(s.discount_pct) : null,
          is_active: s.is_active,
          transaction_count: storeStat?._count.id ?? 0,
          total_discount_given: storeStat?._sum.discount_amount ? Number(storeStat._sum.discount_amount) : 0,
        };
      });
      filename = `stores_${moment().format('YYYY-MM-DD')}.${format}`;
      break;
    }
  }

  logger.info('Report exported', { report_type, format, recordCount: data.length });

  return {
    data,
    filename,
    format,
    record_count: data.length,
    generated_at: new Date().toISOString(),
  };
}

// ─── PUT /admin/members/:id/status — Update member status ──────────────────
export async function updateMemberStatus(
  memberId: string,
  input: UpdateMemberStatusInput,
  adminId: string,
) {
  const membership = await prisma.membership.findUnique({
    where: { id: memberId },
    select: { id: true, member_id: true, status: true },
  });

  if (!membership) {
    throw new AppError('NOT_FOUND', 'Member not found', 404);
  }

  const updated = await prisma.membership.update({
    where: { id: memberId },
    data: { status: input.status },
  });

  // Audit log
  await createAuditLog({
    actorId: adminId,
    action: 'MEMBERSHIP_STATUS_CHANGED',
    targetType: 'membership',
    targetId: membership.id,
    oldValue: { status: membership.status },
    newValue: { status: input.status, reason: input.reason },
  });

  logger.info('Member status updated by admin', {
    memberId: membership.member_id,
    oldStatus: membership.status,
    newStatus: input.status,
    adminId,
  });

  return {
    id: updated.id,
    member_id: updated.member_id,
    status: updated.status,
  };
}
