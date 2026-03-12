'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar} id="main-navbar">
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="17" stroke="#1B5E20" strokeWidth="2" fill="#E8F5E9"/>
              <path d="M18 6L22 14H14L18 6Z" fill="#1B5E20"/>
              <rect x="15" y="14" width="6" height="10" rx="1" fill="#1B5E20"/>
              <path d="M10 26H26" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 28H24" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Owerri Municipal Council</span>
            <span className={styles.logoSubtitle}>E-Certificate Portal</span>
          </div>
        </Link>

        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          id="navbar-toggle"
        >
          <span className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`} />
        </button>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="/#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          <Link href="/#requirements" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Requirements
          </Link>
          <Link href="/verify" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Verify Certificate
          </Link>
          <div className={styles.navActions}>
            <Link href="/login" className={`btn btn-secondary btn-sm ${styles.loginBtn}`}>
              Sign In
            </Link>
            <Link href="/register" className={`btn btn-primary btn-sm ${styles.applyBtn}`}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.goldBar} />
    </nav>
  );
}
