import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';

/**
 * Rate Limiters for different endpoints.
 * Uses in-memory storage — suitable for single-instance deployments (Vercel serverless).
 * For multi-instance deployments, switch to RateLimiterRedis.
 */

// Login endpoints: 5 attempts per 15 minutes per IP
export const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes
  blockDuration: 15 * 60, // Block for 15 minutes after exceeded
});

// Registration: 300 registrations per hour per IP (DEV MODE)
export const registrationRateLimiter = new RateLimiterMemory({
  points: 300,
  duration: 60 * 60, // 1 hour
});

// Application submission: 10 per hour per IP
export const applicationRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60, // 1 hour
});

// Verification page: 30 lookups per minute per IP (prevent scraping)
export const verificationRateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60, // 1 minute
});

// General API: 100 requests per minute per IP
export const generalRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, // 1 minute
});

/**
 * Apply rate limiting to a request.
 * Returns null if allowed, or a NextResponse 429 if rate limited.
 */
export async function applyRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<NextResponse | null> {
  try {
    await limiter.consume(key);
    return null; // Allowed
  } catch {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((limiter as unknown as { blockDuration: number }).blockDuration || 60),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((limiter as unknown as { blockDuration: number }).blockDuration || 60)),
        },
      }
    );
  }
}
