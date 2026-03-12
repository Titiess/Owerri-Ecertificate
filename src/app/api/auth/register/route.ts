import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { applyRateLimit, registrationRateLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimited = await applyRateLimit(registrationRateLimiter, ip);
    if (rateLimited) return rateLimited;

    const textBody = await request.text();
    let body;
    try {
      body = JSON.parse(textBody);
    } catch (err) {
      console.error('Failed to parse JSON body:', textBody);
      return NextResponse.json({ success: false, error: 'Invalid request format.' }, { status: 400 });
    }

    const { email, password, fullName, phone, dateOfBirth } = body;

    // Validation
    if (!email || !password || !fullName || !phone || !dateOfBirth) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.applicant.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Create account
    const passwordHash = await bcrypt.hash(password, 12);
    const applicant = await prisma.applicant.create({
      data: {
        email: emailLower,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please sign in.',
        data: {
          id: applicant.id,
          email: applicant.email,
          fullName: applicant.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTRATION ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
