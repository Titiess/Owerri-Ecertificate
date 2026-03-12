import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Navbar />

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className={styles.hero} id="hero">
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.heroSeal}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" stroke="#DAA520" strokeWidth="2.5" fill="rgba(255,255,255,0.1)"/>
                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <path d="M40 14L48 30H32L40 14Z" fill="#E8F5E9"/>
                <rect x="35" y="30" width="10" height="18" rx="2" fill="#E8F5E9"/>
                <path d="M24 54H56" stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M28 58H52" stroke="#DAA520" strokeWidth="2" strokeLinecap="round"/>
                <path d="M32 62H48" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className={styles.heroTag}>Official Government Portal</p>
            <h1 className={styles.heroTitle}>Certificate of Origin</h1>
            <p className={styles.heroSubtitle}>
              Owerri Municipal Council, Imo State
            </p>
            <div className={styles.heroDivider} />
            <p className={styles.heroDescription}>
              Apply for, track, and receive your Certificate of Origin 
              entirely online. Fast, secure, and officially recognized.
            </p>
            <div className={styles.heroActions}>
              {session?.user?.role === 'APPLICANT' ? (
                <Link href="/dashboard" className={`btn btn-lg ${styles.heroCta}`}>
                  Go to Dashboard
                </Link>
              ) : session?.user?.role === 'ADMIN' || session?.user?.role === 'CHAIRMAN' ? (
                <Link href="/admin/dashboard" className={`btn btn-lg ${styles.heroCta}`}>
                  Go to Admin Dashboard
                </Link>
              ) : (
                <Link href="/register" className={`btn btn-lg ${styles.heroCta}`}>
                  Apply Now
                </Link>
              )}
              <Link href="/verify" className={`btn btn-lg ${styles.heroSecondary}`}>
                Verify a Certificate
              </Link>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className={styles.section} id="how-it-works">
          <div className="container">
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              Get your Certificate of Origin in three simple steps
            </p>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#E8F5E9"/>
                    <path d="M16 20H32M16 26H28M16 32H24" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="34" cy="32" r="6" fill="#1B5E20"/>
                    <path d="M32 32L33.5 33.5L36 31" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={styles.stepTitle}>Create Account & Apply</h3>
                <p className={styles.stepDescription}>
                  Register with your email, then fill out the application form 
                  with your personal details and certificate requirements.
                </p>
              </div>

              <div className={styles.stepConnector}>
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <path d="M0 12H32M32 12L24 4M32 12L24 20" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#E8F5E9"/>
                    <rect x="14" y="14" width="20" height="24" rx="3" stroke="#1B5E20" strokeWidth="2"/>
                    <path d="M20 22H28" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M20 26H26" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="24" cy="34" r="2" fill="#B8860B"/>
                  </svg>
                </div>
                <h3 className={styles.stepTitle}>Pay Securely Online</h3>
                <p className={styles.stepDescription}>
                  Complete the payment securely via Flutterwave. 
                  Your application is submitted automatically after payment.
                </p>
              </div>

              <div className={styles.stepConnector}>
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <path d="M0 12H32M32 12L24 4M32 12L24 20" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="4" width="40" height="40" rx="8" fill="#E8F5E9"/>
                    <rect x="12" y="10" width="24" height="28" rx="2" stroke="#1B5E20" strokeWidth="2"/>
                    <path d="M18 18H30" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M18 22H30" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="26" y="28" width="8" height="8" rx="1" stroke="#B8860B" strokeWidth="1.5"/>
                    <path d="M28 30L30 32L34 28" stroke="#B8860B" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className={styles.stepTitle}>Receive Your Certificate</h3>
                <p className={styles.stepDescription}>
                  Once approved, download your digitally signed certificate 
                  with QR code verification — ready to print.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== REQUIREMENTS ===== */}
        <section className={`${styles.section} ${styles.sectionAlt}`} id="requirements">
          <div className="container">
            <h2 className={styles.sectionTitle}>What You'll Need</h2>
            <p className={styles.sectionSubtitle}>
              Have these details ready before you start your application
            </p>
            <div className={styles.requirementsGrid}>
              <div className={`card card-accent ${styles.requirementCard}`}>
                <h4 className={styles.requirementTitle}>Personal Information</h4>
                <ul className={styles.requirementList}>
                  <li>Full legal name</li>
                  <li>Date of birth</li>
                  <li>Phone number</li>
                  <li>Email address</li>
                </ul>
              </div>
              <div className={`card card-accent ${styles.requirementCard}`}>
                <h4 className={styles.requirementTitle}>Family Details</h4>
                <ul className={styles.requirementList}>
                  <li>Father&apos;s full name</li>
                  <li>Mother&apos;s full name (maiden name)</li>
                </ul>
              </div>
              <div className={`card card-accent ${styles.requirementCard}`}>
                <h4 className={styles.requirementTitle}>Origin Information</h4>
                <ul className={styles.requirementList}>
                  <li>Village/Community (Native Of)</li>
                  <li>Local Government Area</li>
                  <li>State of Origin</li>
                  <li>Purpose of certificate</li>
                </ul>
              </div>
              <div className={`card card-gold ${styles.requirementCard}`}>
                <h4 className={styles.requirementTitle}>Payment</h4>
                <ul className={styles.requirementList}>
                  <li>Certificate Fee: <strong>₦5,000</strong></li>
                  <li>Payment via Flutterwave (card, bank transfer, USSD)</li>
                  <li>Digital receipt provided</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Ready to Apply?</h2>
              <p className={styles.ctaDescription}>
                Create your account and get your Certificate of Origin 
                from the comfort of your home. The entire process takes 
                less than 10 minutes.
              </p>
              <div className={styles.ctaActions}>
                {session ? (
                  <Link href={session.user.role === 'APPLICANT' ? "/dashboard" : "/admin/dashboard"} className="btn btn-lg btn-primary">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn btn-lg btn-primary">
                      Start Application
                    </Link>
                    <Link href="/login" className={`btn btn-lg ${styles.ctaLogin}`}>
                      Already have an account? Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
