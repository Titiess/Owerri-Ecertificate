import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '@/lib/email';
import { generateCertificateHash, generateQRCode } from '@/lib/certificate';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/applications/[id]/approve
 * Approves an application — only ADMIN or CHAIRMAN.
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
        { success: false, error: 'Only applications under review can be approved.' },
        { status: 400 }
      );
    }

    // Get the current Chairman's signature for snapshot
    const chairman = await prisma.adminUser.findFirst({
      where: { role: 'CHAIRMAN', isActive: true },
    });

    const approvedAt = new Date();

    // Generate certificate hash
    const hash = generateCertificateHash({
      referenceNo: application.referenceNo,
      applicantName: application.applicantName,
      dateOfBirth: application.dateOfBirth.toISOString(),
      nativeOf: application.nativeOf,
      stateOfOrigin: application.stateOfOrigin,
      approvedAt: approvedAt.toISOString(),
    });

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(hash);

    // Update application
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: session.user.id,
        approvalChairmanId: chairman?.id || session.user.id,
        approvalSignatureUrl: chairman?.signatureUrl || null,
        approvedAt,
        hash,
      },
    });

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'APPLICATION_APPROVED',
      resourceType: 'Application',
      resourceId: id,
      details: {
        referenceNo: application.referenceNo,
        applicantName: application.applicantName,
        approvedBy: session.user.name,
        hash,
      },
      ipAddress: ip,
    });

    // Send approval email
    await sendApplicationApprovedEmail(
      application.applicant.email,
      application.applicantName,
      application.referenceNo
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Application approved successfully.',
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error('[APPROVE ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to approve application.' }, { status: 500 });
  }
}
