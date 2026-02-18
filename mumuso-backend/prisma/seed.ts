// Seed script — Ref: Primary Spec Section 5, Week 1 deliverable
// Seeds: membership plan, 3 stores, 1 cashier account
// Authorization Decision 1.6: benefits JSONB with seed values

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_COST_FACTOR = 12;

async function main(): Promise<void> {
  console.log('🌱 Seeding Mumuso database...');

  // ─── MEMBERSHIP PLAN ───────────────────────────────────────────────────
  // Ref: Primary Spec Section 6 — membership_plans table
  const plan = await prisma.membershipPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Annual Membership',
      price: 1999.0,
      currency: 'PKR',
      duration_months: 12,
      benefits: [
        'Discount at all Mumuso stores',
        'Exclusive member offers',
        'Track your savings',
      ],
      is_active: true,
    },
  });
  console.log(`✅ Membership plan: ${plan.name} (PKR ${plan.price})`);

  // ─── STORES ─────────────────────────────────────────────────────────────
  // Ref: Primary Spec Section 6 — stores table
  // 3 stores with configured discount percentages

  const stores = [
    {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Mumuso Gulberg',
      address: 'Main Boulevard, Gulberg III',
      city: 'Lahore',
      country: 'Pakistan',
      latitude: 31.5204,
      longitude: 74.3587,
      phone: '+924235761234',
      discount_pct: 12.0,
      is_active: true,
      operating_hours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false },
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Mumuso DHA',
      address: 'Phase 5, DHA',
      city: 'Lahore',
      country: 'Pakistan',
      latitude: 31.4697,
      longitude: 74.3762,
      phone: '+924235891234',
      discount_pct: 10.0,
      is_active: true,
      operating_hours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false },
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      name: 'Mumuso Centaurus',
      address: 'Centaurus Mall, F-8',
      city: 'Islamabad',
      country: 'Pakistan',
      latitude: 33.7077,
      longitude: 73.0498,
      phone: '+925135671234',
      discount_pct: 15.0,
      is_active: true,
      operating_hours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false },
      },
    },
  ];

  for (const store of stores) {
    const created = await prisma.store.upsert({
      where: { id: store.id },
      update: {},
      create: store,
    });
    console.log(`✅ Store: ${created.name} (${created.city}, ${String(created.discount_pct)}% discount)`);

    // Create audit trail entry for initial discount config
    await prisma.storeDiscountConfig.create({
      data: {
        store_id: store.id,
        discount_pct: store.discount_pct,
        min_allowed: 5.0,
        max_allowed: 20.0,
      },
    });
  }

  // ─── CASHIER ACCOUNT ───────────────────────────────────────────────────
  // Ref: Primary Spec Rule 7 — Cashier accounts created by HQ only
  const cashierPassword = await bcrypt.hash('Cashier@123', BCRYPT_COST_FACTOR);

  // Check if cashier already exists (using email with deleted_at = null)
  let cashier = await prisma.user.findFirst({
    where: {
      email: 'cashier.gulberg@mumuso.com',
      deleted_at: null,
    },
  });

  if (!cashier) {
    cashier = await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000020',
        full_name: 'Sara Ahmed',
        email: 'cashier.gulberg@mumuso.com',
        phone: '+923001111111',
        password_hash: cashierPassword,
        role: 'cashier' as UserRole,
        store_id: '00000000-0000-0000-0000-000000000010', // Mumuso Gulberg
        is_active: true,
      },
    });
  }
  console.log(`✅ Cashier: ${cashier.full_name} (${cashier.email})`);

  // ─── SUPER ADMIN ACCOUNT ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@Mumuso2026!', BCRYPT_COST_FACTOR);

  // Check if admin already exists (using email with deleted_at = null)
  let admin = await prisma.user.findFirst({
    where: {
      email: 'admin@mumuso.com',
      deleted_at: null,
    },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000021',
        full_name: 'Mumuso Admin',
        email: 'admin@mumuso.com',
        phone: '+923009999999',
        password_hash: adminPassword,
        role: 'super_admin' as UserRole,
        is_active: true,
      },
    });
  }
  console.log(`✅ Admin: ${admin.full_name} (${admin.email})`);

  // ─── ADDITIONAL USERS FOR INTERFACE TESTING ────────────────────────────
  const sharedTestPassword = await bcrypt.hash('Hello@123', BCRYPT_COST_FACTOR);
  const additionalUsers: Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
    store_id?: string;
  }> = [
    {
      id: '00000000-0000-0000-0000-000000000030',
      full_name: 'Bilal',
      email: 'cashier@gmail.com',
      phone: '+923001234567',
      role: 'cashier',
      store_id: '00000000-0000-0000-0000-000000000010',
    },
    {
      id: '00000000-0000-0000-0000-000000000031',
      full_name: 'Abdullah',
      email: 'super-admin@gmail.com',
      phone: '+923001234568',
      role: 'super_admin',
    },
  ];

  for (const userSeed of additionalUsers) {
    const existing = await prisma.user.findFirst({
      where: { email: userSeed.email, deleted_at: null },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          ...userSeed,
          password_hash: sharedTestPassword,
          is_active: true,
        },
      });
      console.log(`✅ Additional user: ${userSeed.full_name} (${userSeed.email})`);
    } else {
      console.log(`ℹ️  Additional user already exists: ${userSeed.email}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });