import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Route protection middleware.
 * Protects /dashboard/* (applicant routes) and /admin/* (admin routes).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ===== Applicant Dashboard Routes =====
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only applicants can access the dashboard
    if (token.role !== 'APPLICANT') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // ===== Admin Routes =====
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only admin/chairman can access admin routes
    if (token.role !== 'ADMIN' && token.role !== 'CHAIRMAN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Chairman-only routes
    if (pathname.startsWith('/admin/chairman') && token.role !== 'CHAIRMAN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // ===== Redirect logged-in users away from auth pages =====
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      if (token.role === 'APPLICANT') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  if (pathname === '/admin/login') {
    if (token && (token.role === 'ADMIN' || token.role === 'CHAIRMAN')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
