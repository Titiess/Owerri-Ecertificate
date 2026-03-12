import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Check if a Chairman already exists
  const existingChairman = await prisma.adminUser.findFirst({
    where: { role: 'CHAIRMAN' },
  });

  if (existingChairman) {
    console.log('⚠️  Chairman account already exists. Skipping seed.');
    return;
  }

  // Create the initial Chairman account
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 12);

  const chairman = await prisma.adminUser.create({
    data: {
      username: 'chairman',
      passwordHash: hashedPassword,
      role: 'CHAIRMAN',
      name: 'Chairman',
      isActive: true,
    },
  });

  console.log('✅ Chairman account created:');
  console.log(`   Username: chairman`);
  console.log(`   Password: ChangeMe123!`);
  console.log(`   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!`);
  console.log(`   ID: ${chairman.id}`);

  // Create an initial audit log for the seed
  await prisma.auditLog.create({
    data: {
      userId: chairman.id,
      action: 'ADMIN_CREATED',
      resourceType: 'AdminUser',
      resourceId: chairman.id,
      details: { method: 'database_seed', note: 'Initial Chairman account' },
      ipAddress: 'system',
    },
  });

  console.log('✅ Audit log entry created.');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
