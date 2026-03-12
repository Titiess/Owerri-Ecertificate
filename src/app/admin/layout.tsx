'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/dashboard.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isChairman = session?.user?.role === 'CHAIRMAN';
  const isLoginPage = pathname === '/admin/login';

  // Don't show the admin nav on the login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.dashLayout}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Admin Navbar */}
        <nav className={styles.dashNav}>
          <div className={styles.dashNavInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
              <Link href="/admin/dashboard" className={styles.dashNavLogo}>
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="17" stroke="#1B5E20" strokeWidth="2" fill="#E8F5E9"/>
                  <path d="M18 6L22 14H14L18 6Z" fill="#1B5E20"/>
                  <rect x="15" y="14" width="6" height="10" rx="1" fill="#1B5E20"/>
                  <path d="M10 26H26" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className={styles.dashNavTitle}>Admin Panel</span>
              </Link>

              {/* Nav tabs */}
              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <Link
                  href="/admin/dashboard"
                  style={{
                    padding: '6px 16px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: pathname === '/admin/dashboard' ? 600 : 400,
                    color: pathname === '/admin/dashboard' ? 'var(--color-primary)' : 'var(--color-neutral-700)',
                    borderBottom: pathname === '/admin/dashboard' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    textDecoration: 'none',
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  style={{
                    padding: '6px 16px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: pathname.startsWith('/admin/applications') ? 600 : 400,
                    color: pathname.startsWith('/admin/applications') ? 'var(--color-primary)' : 'var(--color-neutral-700)',
                    borderBottom: pathname.startsWith('/admin/applications') ? '2px solid var(--color-primary)' : '2px solid transparent',
                    textDecoration: 'none',
                  }}
                >
                  Applications
                </Link>
                {isChairman && (
                  <>
                    <Link
                      href="/admin/audit"
                      style={{
                        padding: '6px 16px',
                        fontSize: 'var(--text-sm)',
                        fontWeight: pathname.startsWith('/admin/audit') ? 600 : 400,
                        color: pathname.startsWith('/admin/audit') ? 'var(--color-primary)' : 'var(--color-neutral-700)',
                        borderBottom: pathname.startsWith('/admin/audit') ? '2px solid var(--color-primary)' : '2px solid transparent',
                        textDecoration: 'none',
                      }}
                    >
                      Audit Log
                    </Link>
                    <Link
                      href="/admin/users"
                      style={{
                        padding: '6px 16px',
                        fontSize: 'var(--text-sm)',
                        fontWeight: pathname.startsWith('/admin/users') ? 600 : 400,
                        color: pathname.startsWith('/admin/users') ? 'var(--color-primary)' : 'var(--color-neutral-700)',
                        borderBottom: pathname.startsWith('/admin/users') ? '2px solid var(--color-primary)' : '2px solid transparent',
                        textDecoration: 'none',
                      }}
                    >
                      Manage Admins
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className={styles.dashNavRight}>
              <span style={{
                padding: '2px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: isChairman ? 'var(--color-secondary-subtle)' : 'var(--color-primary-subtle)',
                color: isChairman ? 'var(--color-secondary)' : 'var(--color-primary)',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {session?.user?.role}
              </span>
              <span className={styles.dashNavUser}>{session?.user?.name}</span>
              <button className={styles.dashNavSignout} onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </button>
            </div>
          </div>
          <div className={styles.goldBarThin} />
        </nav>

        <main className={styles.dashMain}>
          {children}
        </main>
      </div>
    </div>
  );
}
