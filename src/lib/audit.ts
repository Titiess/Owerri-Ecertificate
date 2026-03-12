import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'APPLICANT_LOGIN'
  | 'APPLICATION_CREATED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'CERTIFICATE_GENERATED'
  | 'CERTIFICATE_DOWNLOADED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'ADMIN_CREATED'
  | 'ADMIN_DEACTIVATED'
  | 'ADMIN_REACTIVATED'
  | 'SIGNATURE_UPDATED'
  | 'PASSWORD_RESET';

export interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Creates an immutable audit log entry.
 * Every admin action on the platform is recorded for accountability.
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: (params.details as Prisma.InputJsonValue) ?? undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    // Audit logging should never break the main flow.
    // Log the error but don't throw.
    console.error('[AUDIT LOG ERROR]', error);
  }
}

/**
 * Extracts client IP address from request headers.
 * Works with Vercel's forwarding headers and standard proxies.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}
