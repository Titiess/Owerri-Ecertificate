'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/apply.module.css';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [appData, setAppData] = useState<{
    referenceNo: string;
    applicantName: string;
    status: string;
    paymentStatus: string;
    certificateType: string;
  } | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(`app-${params.id}`);
    if (cached) {
      const data = JSON.parse(cached);
      setAppData(data);
      if (data.paymentStatus === 'CONFIRMED') {
        router.push(`/dashboard/applications/${params.id}`);
      }
      setChecking(false);
    }

    async function checkApplication() {
      try {
        const res = await fetch(`/api/applications/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setAppData(data.data);
          sessionStorage.setItem(`app-${params.id}`, JSON.stringify(data.data));
          if (data.data.paymentStatus === 'CONFIRMED') {
            // Already paid — redirect to detail
            router.push(`/dashboard/applications/${params.id}`);
          }
        } else {
          setError('Application not found.');
        }
      } catch {
        setError('Failed to load application.');
      } finally {
        setChecking(false);
      }
    }
    checkApplication();
  }, [params.id, router]);

  async function handlePayment() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: params.id }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || 'Failed to initialize payment.');
        setLoading(false);
        return;
      }

      // Redirect to Flutterwave checkout
      window.location.href = result.data.paymentLink;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error && !appData) {
    return (
      <div className={styles.formPage}>
        <div className={styles.formCard} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Error</h2>
          <p style={{ color: 'var(--color-neutral-700)', marginBottom: '24px' }}>{error}</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <Link href="/dashboard" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      <div className={styles.formCard} style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
        <h2 className={styles.formCardTitle} style={{ textAlign: 'center' }}>Complete Payment</h2>
        <p className={styles.formCardDesc} style={{ textAlign: 'center' }}>
          Complete your payment to submit your application for review
        </p>

        {appData && (
          <div className={styles.reviewSection} style={{ textAlign: 'left', marginTop: 'var(--space-6)' }}>
            <div className={styles.reviewGrid}>
              <span className={styles.reviewLabel}>Reference</span>
              <span className={styles.reviewValue} style={{ fontFamily: 'var(--font-mono)' }}>{appData.referenceNo}</span>
              <span className={styles.reviewLabel}>Applicant</span>
              <span className={styles.reviewValue}>{appData.applicantName}</span>
              <span className={styles.reviewLabel}>Certificate</span>
              <span className={styles.reviewValue}>Certificate of Origin</span>
            </div>
          </div>
        )}

        <div className={styles.feeBox} style={{ marginTop: 'var(--space-6)' }}>
          <span className={styles.feeLabel}>Amount Due</span>
          <span className={styles.feeValue}>₦5,000</span>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-error-light)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginTop: 'var(--space-4)',
            border: '1px solid rgba(198,40,40,0.2)'
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: 'var(--space-6)', width: '100%' }}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Redirecting to Payment...</>
          ) : (
            'Pay ₦5,000 with Flutterwave'
          )}
        </button>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 'var(--space-4)' }}>
          Secure payment powered by Flutterwave. You can pay with card, bank transfer, or USSD.
        </p>
      </div>
    </div>
  );
}
