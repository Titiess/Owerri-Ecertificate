import 'dotenv/config';
import crypto from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateHash(ref: string) {
    return crypto.createHash('sha256').update(ref + Date.now()).digest('hex');
}

async function main() {
    const applicantEmail = 'testapplicant_' + Date.now() + '@example.com';

    // 1. Create fake applicant
    const applicant = await prisma.applicant.create({
        data: {
            email: applicantEmail,
            passwordHash: 'dummyhash',
            fullName: 'Chinonso Chukwuemeka',
            phone: '08012345678',
            dateOfBirth: new Date('1990-05-15'),
        }
    });

    // 2. See if chairman exists, get ID
    const chairman = await prisma.adminUser.findFirst({
        where: { role: 'CHAIRMAN' }
    });

    if (!chairman) {
        console.error("Chairman not found. Please run regular seed first.");
        process.exit(1);
    }

    // 3. Create approved application
    const appHash = generateHash('OMC-2026-TESTAPP');
    const application = await prisma.application.create({
        data: {
            referenceNo: 'OMC-2026-TESTAPP',
            applicantId: applicant.id,
            applicantName: 'Chinonso Chukwuemeka',
            dateOfBirth: new Date('1990-05-15'),
            nativeOf: 'Umunne Uratta',
            lga: 'Owerri Municipal',
            stateOfOrigin: 'Imo',
            fatherName: 'Mr. Chukwuemeka Senior',
            motherName: 'Mrs. Ngozi Chukwuemeka',
            purpose: 'Employment Verification',
            status: 'APPROVED',
            paymentStatus: 'CONFIRMED',
            paidAt: new Date(),
            hash: appHash,
            approvedById: chairman.id,
            approvalChairmanId: chairman.id,
            approvedAt: new Date(),
        }
    });

    console.log('Seeded Approved Certificate! View it at:');
    console.log(`http://127.0.0.1:3000/certificate/${appHash}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
