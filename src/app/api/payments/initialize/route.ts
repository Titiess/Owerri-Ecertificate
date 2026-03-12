import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { initializePayment, CERTIFICATE_FEES } from '@/lib/flutterwave';

/**
 * POST /api/payments/initialize
 * Initializes a Flutterwave payment for an application.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'APPLICANT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    // Fetch the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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

    // Check if already paid
    if (application.paymentStatus === 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'This application has already been paid for.' },
        { status: 400 }
      );
    }

    // Get the fee for this certificate type
    const fee = CERTIFICATE_FEES[application.certificateType] || 5000;

    // DEV BYPASS: If no Flutterwave key is set, mock the payment link for testing
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.log('🚧 [DEV MODE] No Flutterwave key found. Using mock payment link.');
      return NextResponse.json({
        success: true,
        data: {
          paymentLink: `/dashboard/applications/payment-callback?status=successful&tx_ref=${application.referenceNo}&transaction_id=mock_${Date.now()}`,
          referenceNo: application.referenceNo,
          amount: fee,
        },
      });
    }

    // Initialize Flutterwave payment
    const paymentResponse = await initializePayment({
      referenceNo: application.referenceNo,
      amount: fee,
      email: application.applicant.email,
      name: application.applicantName,
      phone: application.applicant.phone,
      description: `Certificate of Origin — ${application.referenceNo}`,
    });

    if (paymentResponse.status !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize payment. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentLink: paymentResponse.data.link,
        referenceNo: application.referenceNo,
        amount: fee,
      },
    });
  } catch (error) {
    console.error('[PAYMENT INIT ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment.' },
      { status: 500 }
    );
  }
}
