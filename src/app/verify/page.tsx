'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/verify.module.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface VerifyResult {
  success: boolean;
  verified: boolean;
  hashValid?: boolean;
  status?: string;
  message?: string;
  error?: string;
  data?: {
    referenceNo: string;
    applicantName: string;
    dateOfBirth: string;
    nativeOf: string;
    lga: string;
    stateOfOrigin: string;
    fatherName: string;
    motherName: string;
    approvedAt: string;
    approvedBy: string;
    certificateType: string;
    hash?: string;
  };
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [searchValue, setSearchValue] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // Determine if input is a reference number or hash
      const isRef = searchValue.toUpperCase().startsWith('OMC-');
      const param = isRef ? `ref=${encodeURIComponent(searchValue.trim())}` : `hash=${encodeURIComponent(searchValue.trim())}`;
      
      const res = await fetch(`/api/verify?${param}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, verified: false, error: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.verifyPage}>
        <div className={styles.verifyContainer}>
          <div className={styles.verifyHeader}>
            <h1 className={styles.verifyTitle}>Verify Certificate</h1>
            <p className={styles.verifySubtitle}>
              Enter a certificate reference number or scan the QR code to verify authenticity
            </p>
          </div>

          <div className={styles.verifyCard}>
            <div className={styles.verifyCardAccent} />
            <div className={styles.verifyCardBody}>
              <form onSubmit={handleVerify} className={styles.verifyForm}>
                <div className={styles.verifyFormInput}>
                  <label htmlFor="verifyInput" className="form-label">Reference Number or Certificate Hash</label>
                  <input
                    type="text"
                    id="verifyInput"
                    className="form-input"
                    placeholder="e.g. OMC-2026-00001"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ minHeight: '44px' }}
                >
                  {loading ? <span className="spinner" /> : 'Verify'}
                </button>
              </form>

              {/* Results */}
              {result && (
                <>
                  {result.verified && result.data ? (
                    <div className={`${styles.resultBox} ${styles.resultValid}`}>
                      <span className={`${styles.resultBadge} ${styles.resultBadgeValid}`}>
                        ✓ Verified Certificate
                      </span>
                      {result.hashValid === false && (
                        <div style={{
                          padding: '8px 12px',
                          background: 'var(--color-warning-light)',
                          border: '1px solid rgba(230,140,0,0.2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-warning)',
                          marginBottom: 'var(--space-4)',
                        }}>
                          ⚠️ Hash integrity check failed — this certificate may have been tampered with.
                        </div>
                      )}
                      <div className={styles.resultGrid}>
                        <span className={styles.resultLabel}>Reference No.</span>
                        <span className={styles.resultValue} style={{ fontFamily: 'var(--font-mono)' }}>{result.data.referenceNo}</span>
                        <span className={styles.resultLabel}>Full Name</span>
                        <span className={styles.resultValue}>{result.data.applicantName}</span>
                        <span className={styles.resultLabel}>Date of Birth</span>
                        <span className={styles.resultValue}>{formatDate(result.data.dateOfBirth)}</span>
                        <span className={styles.resultLabel}>Native Of</span>
                        <span className={styles.resultValue}>{result.data.nativeOf}</span>
                        <span className={styles.resultLabel}>LGA</span>
                        <span className={styles.resultValue}>{result.data.lga}</span>
                        <span className={styles.resultLabel}>State of Origin</span>
                        <span className={styles.resultValue}>{result.data.stateOfOrigin}</span>
                        <span className={styles.resultLabel}>Father&apos;s Name</span>
                        <span className={styles.resultValue}>{result.data.fatherName}</span>
                        <span className={styles.resultLabel}>Mother&apos;s Name</span>
                        <span className={styles.resultValue}>{result.data.motherName}</span>
                        <span className={styles.resultLabel}>Certificate Type</span>
                        <span className={styles.resultValue}>{result.data.certificateType}</span>
                        <span className={styles.resultLabel}>Issued On</span>
                        <span className={styles.resultValue}>{formatDate(result.data.approvedAt)}</span>
                        <span className={styles.resultLabel}>Approved By</span>
                        <span className={styles.resultValue}>{result.data.approvedBy}</span>
                        {result.data.hash && (
                          <>
                            <span className={styles.resultLabel}>Document Code</span>
                            <span 
                              className={styles.resultValue} 
                              style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', cursor: 'pointer' }}
                              title="Click to copy hash"
                              onClick={() => {
                                navigator.clipboard.writeText(result.data?.hash || '');
                                alert('Document Code copied to clipboard!');
                              }}
                            >
                              {result.data.hash.substring(0, 8).toUpperCase()} 📋
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : result.verified === false && result.status ? (
                    <div className={`${styles.resultBox} ${styles.resultInvalid}`}>
                      <span className={`${styles.resultBadge} ${styles.resultBadgeInvalid}`}>
                        ⏳ {result.message || 'Application not yet approved'}
                      </span>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', marginBottom: 0 }}>
                        This reference number exists but the certificate has not been issued yet.
                      </p>
                    </div>
                  ) : (
                    <div className={`${styles.resultBox} ${styles.resultNotFound}`}>
                      <span className={`${styles.resultBadge} ${styles.resultBadgeNotFound}`}>
                        ✗ Not Found
                      </span>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', marginBottom: 0 }}>
                        {result.error || 'No certificate found with the provided reference number or hash.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.trustNote}>
            <p>
              This verification service is provided by Owerri Municipal Council, Imo State, Nigeria.
              <br />
              For any issues, contact <strong>verify@owerrimunicipal.gov.ng</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
