import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCertificateHash } from '@/lib/certificate';
import { applyRateLimit, verificationRateLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/audit';

/**
 * GET /api/verify?ref=OMC-XXXX-XXXXX
 * OR
 * GET /api/verify?hash=xxxxx
 * 
 * Public certificate verification endpoint.
 */
export async function GET(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimited = await applyRateLimit(verificationRateLimiter, ip);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');
    const hash = searchParams.get('hash');

    if (!ref && !hash) {
      return NextResponse.json(
        { success: false, error: 'Reference number or certificate hash is required.' },
        { status: 400 }
      );
    }

    let application;

    if (ref) {
      application = await prisma.application.findUnique({
        where: { referenceNo: ref },
        include: { approvedBy: { select: { name: true } } },
      });
    } else if (hash) {
      application = await prisma.application.findFirst({
        where: { hash },
        include: { approvedBy: { select: { name: true } } },
      });
    }

    if (!application) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'No certificate found with the provided information.',
      });
    }

    // Only return verification data for approved certificates
    if (application.status !== 'APPROVED') {
      return NextResponse.json({
        success: true,
        verified: false,
        status: application.status,
        message: application.status === 'PENDING_REVIEW'
          ? 'This application is still under review.'
          : application.status === 'PAYMENT_PENDING'
          ? 'Payment has not been completed for this application.'
          : 'This application has been rejected.',
      });
    }

    // Verify the hash integrity
    const expectedHash = generateCertificateHash({
      referenceNo: application.referenceNo,
      applicantName: application.applicantName,
      dateOfBirth: application.dateOfBirth.toISOString(),
      nativeOf: application.nativeOf,
      stateOfOrigin: application.stateOfOrigin,
      approvedAt: application.approvedAt?.toISOString() || '',
    });

    const hashValid = application.hash === expectedHash;

    return NextResponse.json({
      success: true,
      verified: true,
      hashValid,
      data: {
        referenceNo: application.referenceNo,
        applicantName: application.applicantName,
        dateOfBirth: application.dateOfBirth,
        nativeOf: application.nativeOf,
        lga: application.lga,
        stateOfOrigin: application.stateOfOrigin,
        fatherName: application.fatherName,
        motherName: application.motherName,
        approvedAt: application.approvedAt,
        approvedBy: application.approvedBy?.name || 'Owerri Municipal Council',
        certificateType: 'Certificate of Origin',
        hash: application.hash,
      },
    });
  } catch (error) {
    console.error('[VERIFY ERROR]', error);
    return NextResponse.json({ success: false, error: 'Verification failed.' }, { status: 500 });
  }
}
