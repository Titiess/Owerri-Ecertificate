'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/apply.module.css';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyPayment() {
      const txRef = searchParams.get('tx_ref');
      const transactionId = searchParams.get('transaction_id');
      const flwStatus = searchParams.get('status');

      // If Flutterwave reports failure in the URL
      if (flwStatus === 'cancelled' || flwStatus === 'failed') {
        setStatus('failed');
        setError('Payment was cancelled or failed. Please try again.');
        return;
      }

      if (!txRef || !transactionId) {
        setStatus('failed');
        setError('Missing payment information. Please try again from your dashboard.');
        return;
      }

      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, txRef }),
        });

        const result = await res.json();

        if (result.success) {
          setStatus('success');
          setApplicationId(result.data.applicationId);
        } else {
          setStatus('failed');
          setError(result.error || 'Payment verification failed.');
        }
      } catch {
        setStatus('failed');
        setError('Failed to verify payment. It may still be processing — check your dashboard.');
      }
    }

    verifyPayment();
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className={styles.formPage}>
        <div className={styles.formCard} style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 24px' }} />
          <h2 className={styles.formCardTitle} style={{ textAlign: 'center' }}>Verifying Payment...</h2>
          <p className={styles.formCardDesc} style={{ textAlign: 'center' }}>
            Please wait while we confirm your payment with Flutterwave.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.formPage}>
        <div className={`${styles.formCard} ${styles.successCard}`}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Payment Confirmed!</h2>
          <p className={styles.successText}>
            Your payment has been received and your application is now under review.
            You will be notified by email when a decision has been made.
          </p>
          <div className={styles.successActions}>
            {applicationId && (
              <Link href={`/dashboard/applications/${applicationId}`} className="btn btn-primary">
                View Application
              </Link>
            )}
            <Link href="/dashboard" className="btn btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className={styles.formPage}>
      <div className={styles.formCard} style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 className={styles.formCardTitle} style={{ textAlign: 'center' }}>Payment Issue</h2>
        <p style={{ color: 'var(--color-neutral-700)', maxWidth: '420px', margin: '0 auto 24px', fontSize: 'var(--text-sm)' }}>
          {error}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className={styles.formPage}>
        <div className={styles.formCard} style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 24px' }} />
          <h2 className={styles.formCardTitle} style={{ textAlign: 'center' }}>Loading...</h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
