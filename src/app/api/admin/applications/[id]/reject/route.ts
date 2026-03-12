import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { sendApplicationRejectedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/applications/[id]/reject
 * Rejects an application — only ADMIN or CHAIRMAN.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CHAIRMAN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ip = getClientIp(request);
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required.' },
        { status: 400 }
      );
    }

    // Find application
    const application = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 });
    }

    if (application.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { success: false, error: 'Only applications under review can be rejected.' },
        { status: 400 }
      );
    }

    // Update application
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        approvedById: session.user.id,
      },
    });

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'APPLICATION_REJECTED',
      resourceType: 'Application',
      resourceId: id,
      details: {
        referenceNo: application.referenceNo,
        applicantName: application.applicantName,
        rejectedBy: session.user.name,
        reason: reason.trim(),
      },
      ipAddress: ip,
    });

    // Send rejection email
    await sendApplicationRejectedEmail(
      application.applicant.email,
      application.applicantName,
      application.referenceNo,
      reason.trim()
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Application rejected.',
    });
  } catch (error) {
    console.error('[REJECT ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to reject application.' }, { status: 500 });
  }
}
