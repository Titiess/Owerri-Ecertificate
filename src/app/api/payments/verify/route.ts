import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { verifyTransaction, CERTIFICATE_FEES } from '@/lib/flutterwave';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { sendPaymentConfirmedEmail } from '@/lib/email';

/**
 * POST /api/payments/verify
 * Client-side payment verification — fallback for webhook failures.
 * Called after the user returns from Flutterwave checkout.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'APPLICANT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, txRef } = body;

    if (!transactionId || !txRef) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID and reference are required.' },
        { status: 400 }
      );
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { referenceNo: txRef },
      include: { applicant: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (application.applicantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If already confirmed (e.g., by webhook), just return success
    if (application.paymentStatus === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        data: { status: 'CONFIRMED', applicationId: application.id },
        message: 'Payment already confirmed.',
      });
    }

    // DEV BYPASS: If no Flutterwave key is set, mock the server-side verification
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.log('🚧 [DEV MODE] No Flutterwave key found. Mocking successful verification.');
      
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentReference: `mock_ref_${Date.now()}`,
          paidAt: new Date(),
          status: 'PENDING_REVIEW',
        },
      });

      const ip = getClientIp(request);
      await createAuditLog({
        action: 'PAYMENT_CONFIRMED',
        resourceType: 'Application',
        resourceId: application.id,
        details: {
          referenceNo: txRef,
          transactionId,
          flutterwaveRef: `mock_ref_${Date.now()}`,
          amount: CERTIFICATE_FEES[application.certificateType] || 5000,
          method: 'mock_verification',
        },
        ipAddress: ip,
      });

      return   NextResponse.json({
        success: true,
        data: { status: 'CONFIRMED', applicationId: application.id },
        message: 'Mock Payment verified and confirmed.',
      });
    }

    // Verify with Flutterwave server-side
    const verification = await verifyTransaction(transactionId);

    if (verification.status === 'success' && verification.data.status === 'successful') {
      const expectedFee = CERTIFICATE_FEES[application.certificateType] || 5000;

      if (verification.data.amount < expectedFee) {
        return NextResponse.json(
          { success: false, error: 'Payment amount does not match the required fee.' },
          { status: 400 }
        );
      }

      // Update application
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentReference: verification.data.flw_ref,
          paidAt: new Date(),
          status: 'PENDING_REVIEW',
        },
      });

      const ip = getClientIp(request);
      await createAuditLog({
        action: 'PAYMENT_CONFIRMED',
        resourceType: 'Application',
        resourceId: application.id,
        details: {
          referenceNo: txRef,
          transactionId,
          flutterwaveRef: verification.data.flw_ref,
          amount: verification.data.amount,
          method: 'client_verification',
        },
        ipAddress: ip,
      });

      // Send confirmation email
      await sendPaymentConfirmedEmail(
        application.applicant.email,
        application.applicantName,
        application.referenceNo,
        verification.data.flw_ref
      );

      return NextResponse.json({
        success: true,
        data: { status: 'CONFIRMED', applicationId: application.id },
        message: 'Payment verified and confirmed.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Payment verification failed. Please contact support.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[PAYMENT VERIFY ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed.' },
      { status: 500 }
    );
  }
}
