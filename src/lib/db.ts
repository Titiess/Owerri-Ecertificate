import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prevent multiple Prisma Client and pg.Pool instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

