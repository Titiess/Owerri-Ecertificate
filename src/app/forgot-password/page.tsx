'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authCardAccent} />
          <div className={styles.authCardBody}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h1 className={styles.authTitle}>Check Your Email</h1>
              <p className={styles.authSubtitle}>
                If an account exists with that email address, we&apos;ve sent you a password reset link. 
                Please check your inbox and spam folder.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <Link href="/login" className={styles.authBackLink}>
        ← Back to Sign In
      </Link>

      <div className={styles.authCard}>
        <div className={styles.authCardAccent} />
        <div className={styles.authCardBody}>
          <Link href="/" className={styles.authLogo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="17" stroke="#1B5E20" strokeWidth="2" fill="#E8F5E9"/>
              <path d="M18 6L22 14H14L18 6Z" fill="#1B5E20"/>
              <rect x="15" y="14" width="6" height="10" rx="1" fill="#1B5E20"/>
              <path d="M10 26H26" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 28H24" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className={styles.authLogoText}>
              <div className={styles.authLogoTitle}>Owerri Municipal Council</div>
              <div className={styles.authLogoSub}>E-Certificate Portal</div>
            </div>
          </Link>

          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && <div className={`${styles.authAlert} ${styles.authAlertError}`}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label htmlFor="email" className="form-label form-label-required">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.authSubmit}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Sending...</>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Remember your password?{' '}
              <Link href="/login" className={styles.authFooterLink}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
