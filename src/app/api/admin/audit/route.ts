import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/admin/audit
 * Returns audit log entries. Only accessible by CHAIRMAN.
 */
export async function GET(request: Request) {
  try {
    console.log('[API] Audit route started at:', Date.now());
    const sessionStart = Date.now();
    const session = await getServerSession(authOptions);
    console.log('[API] got session in', Date.now() - sessionStart, 'ms');

    if (!session || session.user.role !== 'CHAIRMAN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const action = searchParams.get('action');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;

    console.log('[API] starting prisma queries at:', Date.now());
    const queryStart = Date.now();
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, username: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    console.log('[API] finished prisma queries in', Date.now() - queryStart, 'ms');

    return NextResponse.json({
      success: true,
      data: {
        items: logs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs.' }, { status: 500 });
  }
}
