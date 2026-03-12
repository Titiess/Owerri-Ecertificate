'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className={styles.dashLayout}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Dashboard Navbar */}
        <nav className={styles.dashNav}>
          <div className={styles.dashNavInner}>
            <Link href="/dashboard" className={styles.dashNavLogo}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="17" stroke="#1B5E20" strokeWidth="2" fill="#E8F5E9"/>
                <path d="M18 6L22 14H14L18 6Z" fill="#1B5E20"/>
                <rect x="15" y="14" width="6" height="10" rx="1" fill="#1B5E20"/>
                <path d="M10 26H26" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className={styles.dashNavTitle}>E-Certificate Portal</span>
            </Link>

            <div className={styles.dashNavRight}>
              <span className={styles.dashNavUser}>
                {session?.user?.name || 'Applicant'}
              </span>
              <button
                className={styles.dashNavSignout}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className={styles.goldBarThin} />
        </nav>

        {/* Main content */}
        <main className={styles.dashMain}>
          {children}
        </main>
      </div>
    </div>
  );
}
