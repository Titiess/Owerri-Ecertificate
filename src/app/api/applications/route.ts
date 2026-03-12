import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateReferenceNumber } from '@/lib/certificate';
import { applyRateLimit, applicationRateLimiter } from '@/lib/rate-limit';
import { getClientIp, createAuditLog } from '@/lib/audit';

// GET /api/applications — List applicant's applications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'APPLICANT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { applicantId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { files: true },
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('[GET APPLICATIONS ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 });
  }
}

// POST /api/applications — Create a new application
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'APPLICANT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const ip = getClientIp(request);
    const rateLimited = await applyRateLimit(applicationRateLimiter, ip);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const {
      fullName, dateOfBirth, nativeOf, lga, stateOfOrigin,
      fatherName, motherName, purpose, certificateType,
    } = body;

    // Validation
    const requiredFields = { fullName, dateOfBirth, nativeOf, lga, stateOfOrigin, fatherName, motherName, purpose };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          { success: false, error: `${key} is required.` },
          { status: 400 }
        );
      }
    }

    // Generate unique reference number
    const count = await prisma.application.count();
    const referenceNo = generateReferenceNumber(count + 1);

    // Create application
    const application = await prisma.application.create({
      data: {
        referenceNo,
        applicantId: session.user.id,
        applicantName: fullName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        nativeOf: nativeOf.trim(),
        lga: lga.trim(),
        stateOfOrigin: stateOfOrigin.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        purpose: purpose.trim(),
        certificateType: certificateType || 'STATE_OF_ORIGIN',
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PENDING',
      },
    });

    // Audit log
    await createAuditLog({
      action: 'APPLICATION_CREATED',
      resourceType: 'Application',
      resourceId: application.id,
      details: { referenceNo, applicantName: fullName, certificateType: certificateType || 'STATE_OF_ORIGIN' },
      ipAddress: ip,
    });

    return NextResponse.json(
      { success: true, data: application, message: 'Application created successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE APPLICATION ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to create application.' }, { status: 500 });
  }
}
