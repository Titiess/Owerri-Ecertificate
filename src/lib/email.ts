import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build_only');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@owerrimunicipal.gov.ng';
const APP_NAME = 'Owerri Municipal Council E-Certificate';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// Email Templates
// ============================================

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          color: #1A1A2E; 
          line-height: 1.6; 
          margin: 0; 
          padding: 0;
          background-color: #F5F5F5; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #1B5E20, #2E7D32); 
          padding: 32px 24px; 
          text-align: center; 
        }
        .header h1 { 
          color: #FFFFFF; 
          font-size: 20px; 
          margin: 0;
          font-weight: 700; 
        }
        .header .subtitle {
          color: #E8F5E9;
          font-size: 13px;
          margin-top: 4px;
        }
        .gold-bar {
          height: 3px;
          background: linear-gradient(90deg, #B8860B, #DAA520, #B8860B);
        }
        .body { 
          padding: 32px 24px; 
        }
        .body p { 
          margin-bottom: 16px;
          color: #4A4A5A;
        }
        .body strong {
          color: #1A1A2E;
        }
        .ref-box {
          background: #F5F5F5;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin: 24px 0;
        }
        .ref-box .label {
          font-size: 12px;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .ref-box .value {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 18px;
          font-weight: 600;
          color: #1B5E20;
        }
        .cta-btn {
          display: inline-block;
          padding: 14px 32px;
          background: #1B5E20;
          color: #FFFFFF !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          margin: 8px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-approved { background: #E8F5E9; color: #2E7D32; }
        .status-rejected { background: #FFEBEE; color: #C62828; }
        .footer { 
          padding: 24px; 
          text-align: center; 
          font-size: 12px; 
          color: #9E9E9E;
          background: #F5F5F5;
          border-top: 1px solid #E0E0E0;
        }
        .footer a { color: #1B5E20; }
      </style>
    </head>
    <body>
      <div style="padding: 24px 16px; background: #F5F5F5;">
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
            <div class="subtitle">Owerri Municipal Council, Imo State</div>
          </div>
          <div class="gold-bar"></div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Owerri Municipal Council. All rights reserved.</p>
            <p>This is an automated message. Do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// Email Sending Functions
// ============================================

/**
 * Send application submitted confirmation
 */
export async function sendApplicationSubmittedEmail(
  to: string,
  applicantName: string,
  referenceNo: string
) {
  const html = baseTemplate(`
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Your application has been submitted successfully. Please complete the payment to proceed.</p>
    <div class="ref-box">
      <div class="label">Reference Number</div>
      <div class="value">${referenceNo}</div>
    </div>
    <p>Keep this reference number safe. You will need it to track your application.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="cta-btn">View My Dashboard</a>
    </p>
  `);

  return sendEmail(to, `Application Submitted — ${referenceNo}`, html);
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmedEmail(
  to: string,
  applicantName: string,
  referenceNo: string,
  paymentReference: string
) {
  const html = baseTemplate(`
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Your payment has been confirmed. Your application is now under review.</p>
    <div class="ref-box">
      <div class="label">Reference Number</div>
      <div class="value">${referenceNo}</div>
    </div>
    <p><strong>Payment Reference:</strong> ${paymentReference}</p>
    <p>Our team will review your application and you will be notified of the outcome.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="cta-btn">Track Application</a>
    </p>
  `);

  return sendEmail(to, `Payment Confirmed — ${referenceNo}`, html);
}

/**
 * Send application approved notification
 */
export async function sendApplicationApprovedEmail(
  to: string,
  applicantName: string,
  referenceNo: string
) {
  const html = baseTemplate(`
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Congratulations! Your application has been <span class="status-badge status-approved">Approved</span>.</p>
    <div class="ref-box">
      <div class="label">Reference Number</div>
      <div class="value">${referenceNo}</div>
    </div>
    <p>Your certificate is now ready for download from your dashboard.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="cta-btn">Download Certificate</a>
    </p>
  `);

  return sendEmail(to, `Certificate Approved — ${referenceNo}`, html);
}

/**
 * Send application rejected notification
 */
export async function sendApplicationRejectedEmail(
  to: string,
  applicantName: string,
  referenceNo: string,
  rejectionReason: string
) {
  const html = baseTemplate(`
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>We regret to inform you that your application has been <span class="status-badge status-rejected">Rejected</span>.</p>
    <div class="ref-box">
      <div class="label">Reference Number</div>
      <div class="value">${referenceNo}</div>
    </div>
    <p><strong>Reason:</strong> ${rejectionReason}</p>
    <p>If you believe this is an error, please contact the Owerri Municipal Council office for assistance.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="cta-btn">View Application</a>
    </p>
  `);

  return sendEmail(to, `Application Update — ${referenceNo}`, html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  applicantName: string,
  resetToken: string
) {
  const resetUrl = `${APP_URL}/forgot-password/reset?token=${resetToken}`;
  const html = baseTemplate(`
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="cta-btn">Reset Password</a>
    </p>
    <p style="font-size: 13px; color: #9E9E9E;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `);

  return sendEmail(to, 'Password Reset Request', html);
}

// ============================================
// Core Send Function
// ============================================

async function sendEmail(to: string, subject: string, html: string) {
  try {
    // DEV BYPASS: If no Resend key is set, mock the email send
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy_key_for_build_only') {
      console.log(`🚧 [DEV MODE] Mock sending email to ${to} with subject: ${subject}`);
      return { success: true, data: { id: `mock_email_${Date.now()}` } };
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[${APP_NAME}] ${subject}`,
      html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return { success: false, error };
  }
}
