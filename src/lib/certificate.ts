import crypto from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Generate a SHA-256 hash for a certificate.
 * The hash is based on immutable application data to ensure integrity.
 */
export function generateCertificateHash(data: {
  referenceNo: string;
  applicantName: string;
  dateOfBirth: string;
  nativeOf: string;
  stateOfOrigin: string;
  approvedAt: string;
}): string {
  const payload = [
    data.referenceNo,
    data.applicantName,
    data.dateOfBirth,
    data.nativeOf,
    data.stateOfOrigin,
    data.approvedAt,
    // Add a server-side secret to prevent hash forgery
    process.env.CERTIFICATE_HASH_SECRET || 'default-secret-change-me',
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generate a QR code as a URL using a public API.
 * The QR code links to the public verification page.
 */
export async function generateQRCode(hash: string): Promise<string> {
  const verificationUrl = encodeURIComponent(`${APP_URL}/verify?hash=${hash}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${verificationUrl}&color=1A1A2E&bgcolor=FFFFFF`;
}

/**
 * Generate a unique reference number.
 * Format: OMC-YYYY-NNNNN (e.g., OMC-2026-00001)
 */
export function generateReferenceNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(5, '0');
  return `OMC-${year}-${padded}`;
}
