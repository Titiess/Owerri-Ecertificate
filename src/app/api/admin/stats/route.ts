import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/admin/stats
 * Returns dashboard statistics for admins.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CHAIRMAN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalApplications,
      pendingReview,
      approved,
      rejected,
      totalPaid,
      monthApplications,
      monthApproved,
      monthPaid,
    ] = await prisma.$transaction([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { paymentStatus: 'CONFIRMED' } }),
      prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.application.count({ where: { status: 'APPROVED', approvedAt: { gte: startOfMonth } } }),
      prisma.application.count({ where: { paymentStatus: 'CONFIRMED', paidAt: { gte: startOfMonth } } }),
    ]);

    // Revenue calculation (₦5,000 per confirmed payment)
    const feePerCertificate = 5000;
    const totalRevenue = totalPaid * feePerCertificate;
    const monthRevenue = monthPaid * feePerCertificate;

    return NextResponse.json({
      success: true,
      data: {
        totalApplications,
        pendingReview,
        approved,
        rejected,
        totalRevenue,
        thisMonth: {
          applications: monthApplications,
          approved: monthApproved,
          revenue: monthRevenue,
        },
      },
    });
  } catch (error) {
    console.error('[ADMIN STATS ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats.' }, { status: 500 });
  }
}
