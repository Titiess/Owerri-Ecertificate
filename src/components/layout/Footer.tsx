import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="main-footer">
      <div className={styles.goldBar} />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: About */}
          <div className={styles.column}>
            <div className={styles.brandBlock}>
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="17" stroke="#2E7D32" strokeWidth="2" fill="rgba(232,245,233,0.15)"/>
                <path d="M18 6L22 14H14L18 6Z" fill="#E8F5E9"/>
                <rect x="15" y="14" width="6" height="10" rx="1" fill="#E8F5E9"/>
                <path d="M10 26H26" stroke="#DAA520" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 28H24" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <h3 className={styles.brandName}>Owerri Municipal Council</h3>
                <p className={styles.brandSub}>E-Certificate Portal</p>
              </div>
            </div>
            <p className={styles.description}>
              Official digital platform for applying, processing, and verifying
              Certificates of Origin issued by Owerri Municipal Council, Imo State.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link href="/" className={styles.link}>Home</Link></li>
              <li><Link href="/register" className={styles.link}>Apply for Certificate</Link></li>
              <li><Link href="/verify" className={styles.link}>Verify Certificate</Link></li>
              <li><Link href="/login" className={styles.link}>Sign In</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Contact Us</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>Owerri Municipal Council Secretariat, Owerri, Imo State, Nigeria</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+234 800 000 0000</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <span>info@owerrimunicipal.gov.ng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Owerri Municipal Council. All rights reserved.
          </p>
          <p className={styles.govText}>
            An official platform of the Owerri Municipal Local Government, Imo State, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}
