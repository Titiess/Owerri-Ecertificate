import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    console.log("Successfully created PrismaClient with pg pool!");
    process.exit(0);
} catch (e: any) {
    console.error("Error:", e.message);
    process.exit(1);
}
