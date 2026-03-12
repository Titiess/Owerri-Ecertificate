'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: (formData.get('fullName') as string).trim().replace(/\r?\n|\r/g, ''),
      email: (formData.get('email') as string).trim().replace(/\r?\n|\r/g, ''),
      phone: (formData.get('phone') as string).trim(),
      dateOfBirth: formData.get('dateOfBirth') as string,
      password: formData.get('password') as string,
    };

    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (data.password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => router.push('/login'), 2000);
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

          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSubtitle}>Register to apply for your Certificate of Origin</p>

          {error && <div className={`${styles.authAlert} ${styles.authAlertError}`}>{error}</div>}
          {success && <div className={`${styles.authAlert} ${styles.authAlertSuccess}`}>{success}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label form-label-required">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="Enter your full legal name"
                required
                disabled={loading}
              />
            </div>

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
              />
            </div>

            <div className={styles.authRow}>
              <div className="form-group">
                <label htmlFor="phone" className="form-label form-label-required">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="08012345678"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label form-label-required">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label-required">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="At least 8 characters"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label form-label-required">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.authSubmit}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Already have an account?{' '}
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
