import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/db';
import { validateWebhookSignature } from '@/lib/flutterwave';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { sendPaymentConfirmedEmail } from '@/lib/email';

/**
 * POST /api/payments/webhook
 * Flutterwave webhook handler — the SOURCE OF TRUTH for payment status.
 * 
 * Flutterwave sends a POST request to this endpoint when a payment
 * is completed, failed, or cancelled.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Validate webhook signature
    const signature = request.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    if (!secretHash || !validateWebhookSignature(signature, secretHash)) {
      console.warn('[WEBHOOK] Invalid signature from IP:', ip);
      return NextResponse.json({ status: 'error' }, { status: 401 });
    }

    const body = await request.json();
    const { event, data } = body;

    // We only care about successful charges
    if (event !== 'charge.completed') {
      return NextResponse.json({ status: 'ok' });
    }

    const txRef = data.tx_ref;       // Our reference number (OMC-YYYY-NNNNN)
    const flwRef = data.flw_ref;     // Flutterwave's reference
    const status = data.status;       // "successful", "failed"
    const amount = data.amount;

    if (!txRef) {
      console.warn('[WEBHOOK] Missing tx_ref in payload');
      return NextResponse.json({ status: 'error' }, { status: 400 });
    }

    // Find the application by reference number
    const application = await prisma.application.findUnique({
      where: { referenceNo: txRef },
      include: { applicant: true },
    });

    if (!application) {
      console.warn('[WEBHOOK] Application not found for ref:', txRef);
      return NextResponse.json({ status: 'error' }, { status: 404 });
    }

    // Prevent duplicate processing
    if (application.paymentStatus === 'CONFIRMED') {
      return NextResponse.json({ status: 'ok', message: 'Already processed' });
    }

    if (status === 'successful') {
      // Verify the amount matches
      const expectedFee = 5000; // Or look up from CERTIFICATE_FEES
      if (amount < expectedFee) {
        console.warn('[WEBHOOK] Amount mismatch:', { expected: expectedFee, received: amount, ref: txRef });
        // Mark as failed due to underpayment
        await prisma.application.update({
          where: { id: application.id },
          data: {
            paymentStatus: 'FAILED',
            paymentReference: flwRef,
          },
        });
        return NextResponse.json({ status: 'error', message: 'Amount mismatch' });
      }

      // Update application: payment confirmed, status moves to PENDING_REVIEW
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentReference: flwRef,
          paidAt: new Date(),
          status: 'PENDING_REVIEW',
        },
      });

      // Audit log
      await createAuditLog({
        action: 'PAYMENT_CONFIRMED',
        resourceType: 'Application',
        resourceId: application.id,
        details: {
          referenceNo: txRef,
          flutterwaveRef: flwRef,
          amount,
          event,
        },
        ipAddress: ip,
      });

      // Send confirmation email
      await sendPaymentConfirmedEmail(
        application.applicant.email,
        application.applicantName,
        application.referenceNo,
        flwRef
      );

      console.log('[WEBHOOK] Payment confirmed for:', txRef);
    } else {
      // Payment failed
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'FAILED',
          paymentReference: flwRef,
        },
      });

      await createAuditLog({
        action: 'PAYMENT_FAILED',
        resourceType: 'Application',
        resourceId: application.id,
        details: { referenceNo: txRef, flutterwaveRef: flwRef, status, amount },
        ipAddress: ip,
      });

      console.log('[WEBHOOK] Payment failed for:', txRef);
    }

    // Always return 200 to Flutterwave so they don't retry
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    // Return 200 even on errors to prevent Flutterwave retries
    return NextResponse.json({ status: 'ok' });
  }
}
