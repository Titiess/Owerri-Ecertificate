import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CHAIRMAN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const admins = await prisma.adminUser.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, username: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CHAIRMAN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Enforce limit of 10 admins.
    const currentAdminCount = await prisma.adminUser.count({
      where: { role: 'ADMIN' }
    });

    if (currentAdminCount >= 10) {
      return NextResponse.json({ success: false, error: 'Maximum limit of 10 Admins reached.' }, { status: 400 });
    }

    // Check if username exists
    const existing = await prisma.adminUser.findUnique({ where: { username: username.toLowerCase().trim() } });
    if (existing) {
       return NextResponse.json({ success: false, error: 'Username already taken.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.adminUser.create({
      data: {
        name,
        username: username.toLowerCase().trim(),
        passwordHash,
        role: 'ADMIN',
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATED_ADMIN',
        resourceType: 'AdminUser',
        resourceId: newAdmin.id,
        details: { username: newAdmin.username }
      }
    });

    return NextResponse.json({ success: true, data: { id: newAdmin.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create admin' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CHAIRMAN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
       return NextResponse.json({ success: false, error: 'Missing ID param' }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin || admin.role === 'CHAIRMAN') {
       return NextResponse.json({ success: false, error: 'Cannot delete this user' }, { status: 400 });
    }

    await prisma.adminUser.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETED_ADMIN',
        resourceType: 'AdminUser',
        resourceId: id,
        details: { username: admin.username }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete admin' }, { status: 500 });
  }
}
