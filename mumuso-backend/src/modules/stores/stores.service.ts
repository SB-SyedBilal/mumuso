// Stores service — Ref: Primary Spec Section 10
// Rules: Only active stores with discount_pct visible to customers

import moment from 'moment-timezone';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { OperatingHours, DayHours } from '../../types';
import { StoresQueryInput } from './stores.schema';

// Compute is_open_now based on Pakistan time — Ref: Primary Spec Section 10
function isOpenNow(operatingHours: unknown): boolean {
  if (!operatingHours || typeof operatingHours !== 'object') return false;

  const hours = operatingHours as OperatingHours;
  const now = moment.tz('Asia/Karachi');
  const dayName = now.format('dddd').toLowerCase() as keyof OperatingHours;
  const dayHours: DayHours | undefined = hours[dayName];

  if (!dayHours || dayHours.closed) return false;

  const currentTime = now.format('HH:mm');
  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

// GET /stores — Ref: Primary Spec Section 10
export async function listStores(query: StoresQueryInput) {
  const where: Record<string, unknown> = {
    is_active: true,
    discount_pct: { not: null },
  };

  if (query.city) {
    where.city = { contains: query.city, mode: 'insensitive' };
  }
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  let orderBy: Record<string, string> | undefined;
  if (query.sort === 'discount_asc') {
    orderBy = { discount_pct: 'asc' };
  } else if (query.sort === 'discount_desc') {
    orderBy = { discount_pct: 'desc' };
  }

  const stores = await prisma.store.findMany({
    where,
    orderBy: orderBy ?? { name: 'asc' },
  });

  return {
    stores: stores.map((store) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      city: store.city,
      latitude: store.latitude ? Number(store.latitude) : null,
      longitude: store.longitude ? Number(store.longitude) : null,
      discount_pct: Number(store.discount_pct),
      phone: store.phone,
      operating_hours: store.operating_hours,
      is_open_now: isOpenNow(store.operating_hours),
    })),
  };
}

// GET /stores/:id — Ref: Primary Spec Section 10
export async function getStoreById(storeId: string) {
  const store = await prisma.store.findFirst({
    where: { id: storeId, is_active: true, discount_pct: { not: null } },
  });

  if (!store) {
    throw new AppError('NOT_FOUND', 'Store not found', 404);
  }

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    city: store.city,
    country: store.country,
    latitude: store.latitude ? Number(store.latitude) : null,
    longitude: store.longitude ? Number(store.longitude) : null,
    discount_pct: Number(store.discount_pct),
    phone: store.phone,
    operating_hours: store.operating_hours,
    is_open_now: isOpenNow(store.operating_hours),
  };
}
