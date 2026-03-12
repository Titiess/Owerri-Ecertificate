import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/admin/applications
 * Lists all applications for admin review.
 * Supports filtering by status and search.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CHAIRMAN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { applicantName: { contains: search, mode: 'insensitive' } },
        { referenceNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          applicant: { select: { email: true, phone: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: applications,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[ADMIN GET APPS ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 });
  }
}
