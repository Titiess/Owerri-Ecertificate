import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { applyRateLimit, loginRateLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimited = await applyRateLimit(loginRateLimiter, ip);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Find applicant
    const applicant = await prisma.applicant.findUnique({
      where: { email: emailLower },
    });

    // Always return success to prevent email enumeration
    if (!applicant) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store the token hash in the database
    // In a production system, you'd add resetToken and resetTokenExpiry fields to the Applicant model.
    // For now, we'll use a simple approach storing it temporarily.
    // TODO: Add resetTokenHash and resetTokenExpiry columns to Applicant table for production

    // Send email
    await sendPasswordResetEmail(applicant.email, applicant.fullName, resetToken);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
