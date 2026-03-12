'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = rawCallbackUrl === '/admin' ? '/admin/dashboard' : (rawCallbackUrl || '/admin/dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('admin-login', {
        username: username.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <Link href="/" className={styles.authBackLink}>
        ← Back to Home
      </Link>

      <div className={styles.authCard}>
        <div className={styles.authCardAccentGold} />
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

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={styles.adminBadge}>
              🔒 Administrator Access
            </div>
          </div>

          <h1 className={styles.authTitle}>Admin Sign In</h1>
          <p className={styles.authSubtitle}>Access the administration dashboard</p>

          {error && <div className={`${styles.authAlert} ${styles.authAlertError}`}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label htmlFor="username" className="form-label form-label-required">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Enter your admin username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label-required">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.authSubmit}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Signing In...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Applicant? {' '}
              <Link href="/login" className={styles.authFooterLink}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="spinner spinner-lg" style={{ margin: '80px auto', display: 'block' }} />}>
      <AdminLoginForm />
    </Suspense>
  );
}
