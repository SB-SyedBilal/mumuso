// Script to create an admin user — Ref: Law 10.3 (Knowledge transfer)
// Usage: npx ts-node scripts/create-admin.ts

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mumuso.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Mumuso Admin';

  console.log('🔧 Creating admin user...');
  console.log(`Email: ${adminEmail}`);

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`User ID: ${existingAdmin.id}`);
      console.log(`Role: ${existingAdmin.role}`);

      // Update to admin role if not already
      if (existingAdmin.role !== UserRole.super_admin) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: UserRole.super_admin },
        });
        console.log('✅ Updated existing user to admin role');
      }

      await prisma.$disconnect();
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        full_name: adminName,
        email: adminEmail,
        phone: '+923001234567', // Default phone
        password_hash,
        role: UserRole.super_admin,
        is_active: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`User ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.full_name}`);
    console.log(`Role: ${admin.role}`);
    console.log('\n📝 Login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdminUser();
