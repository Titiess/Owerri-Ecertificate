import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient(); // No args! Just relies on process.env.DATABASE_URL

    const start = Date.now();
    const count = await prisma.adminUser.count();
    console.log(`Connected to db natively. Count: ${count} in ${Date.now() - start}ms`);
}

main().catch(console.error);
