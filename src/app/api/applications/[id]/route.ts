import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/applications/[id] — Get single application detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        files: true,
        approvedBy: { select: { name: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 });
    }

    // Applicants can only view their own applications
    if (session.user.role === 'APPLICANT' && application.applicantId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('[GET APPLICATION ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch application.' }, { status: 500 });
  }
}
