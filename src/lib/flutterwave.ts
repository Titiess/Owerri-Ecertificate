/**
 * Flutterwave Integration Helpers
 * Handles payment initialization and verification.
 */

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface InitializePaymentParams {
  referenceNo: string;
  amount: number;
  email: string;
  name: string;
  phone: string;
  description: string;
}

export interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

/**
 * Initialize a Flutterwave payment.
 * Returns a payment link that the user should be redirected to.
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<FlutterwavePaymentResponse> {
  const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: params.referenceNo,
      amount: params.amount,
      currency: 'NGN',
      redirect_url: `${APP_URL}/dashboard/applications/payment-callback`,
      customer: {
        email: params.email,
        name: params.name,
        phonenumber: params.phone,
      },
      customizations: {
        title: 'Owerri Municipal Council',
        description: params.description,
        logo: `${APP_URL}/images/coat-of-arms.png`,
      },
      meta: {
        reference_no: params.referenceNo,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Flutterwave payment initialization failed: ${error}`);
  }

  return response.json();
}

/**
 * Verify a Flutterwave transaction by its ID.
 * This is the server-side verification — source of truth.
 */
export async function verifyTransaction(
  transactionId: string
): Promise<FlutterwaveVerifyResponse> {
  const response = await fetch(
    `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Flutterwave verification failed: ${error}`);
  }

  return response.json();
}

/**
 * Validate the Flutterwave webhook signature.
 * Ensures the webhook is genuinely from Flutterwave.
 */
export function validateWebhookSignature(
  signature: string | null,
  secretHash: string
): boolean {
  if (!signature) return false;
  return signature === secretHash;
}

/**
 * Certificate fee in Naira.
 * In the future, this can be moved to a database-driven config per certificate type.
 */
export const CERTIFICATE_FEES: Record<string, number> = {
  STATE_OF_ORIGIN: 5000, // ₦5,000 — adjust as needed
};
