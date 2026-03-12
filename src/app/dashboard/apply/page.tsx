'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/apply.module.css';
import { CERTIFICATE_TYPE_CONFIGS } from '@/types';

const CERTIFICATE_FEE = CERTIFICATE_TYPE_CONFIGS[0]?.fee || 5000;

type FormData = {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  fatherName: string;
  motherName: string;
  nativeOf: string;
  lga: string;
  stateOfOrigin: string;
  purpose: string;
  certificateType: string;
};

const initialFormData: FormData = {
  fullName: '',
  dateOfBirth: '',
  phone: '',
  fatherName: '',
  motherName: '',
  nativeOf: '',
  lga: '',
  stateOfOrigin: '',
  purpose: '',
  certificateType: 'STATE_OF_ORIGIN',
};

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successRef, setSuccessRef] = useState('');

  const totalSteps = 4; // Personal, Family, Origin, Review

  function updateField(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setError('');
    // Validate current step
    if (step === 1) {
      if (!formData.fullName || !formData.dateOfBirth) {
        setError('Please fill in all required fields.');
        return;
      }
    } else if (step === 2) {
      if (!formData.fatherName || !formData.motherName) {
        setError('Please fill in all required fields.');
        return;
      }
    } else if (step === 3) {
      if (!formData.nativeOf || !formData.lga || !formData.stateOfOrigin || !formData.purpose) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    setStep(s => Math.min(s + 1, totalSteps));
  }

  function prevStep() {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to submit application.');
        setLoading(false);
        return;
      }

      setSuccessRef(result.data.referenceNo);
      setStep(5); // Success state
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  // Success state
  if (step === 5) {
    return (
      <div className={styles.formPage}>
        <div className={`${styles.formCard} ${styles.successCard}`}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Application Submitted!</h2>
          <div className={styles.successRef}>{successRef}</div>
          <p className={styles.successText}>
            Your application has been created. Please complete your payment 
            to proceed. You can track the status of your application from your dashboard.
          </p>
          <div className={styles.successActions}>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <Link href="/dashboard" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
        <h1 className={styles.formTitle} style={{ marginTop: 'var(--space-4)' }}>
          New Application
        </h1>
        <p className={styles.formSubtitle}>Certificate of Origin — Owerri Municipal Council</p>
      </div>

      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className={`${styles.stepDot} ${step === s ? styles.stepDotActive : ''} ${step > s ? styles.stepDotDone : ''}`}>
              {step > s ? '✓' : s}
            </div>
            {i < 3 && (
              <div className={`${styles.stepLine} ${step > s ? styles.stepLineDone : ''}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-error-light)',
          color: 'var(--color-error)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
          border: '1px solid rgba(198,40,40,0.2)'
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Personal Details</h3>
          <p className={styles.formCardDesc}>Enter the applicant&apos;s personal information</p>

          <div className="form-group">
            <label htmlFor="fullName" className="form-label form-label-required">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="Enter full legal name"
              value={formData.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label form-label-required">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={e => updateField('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                placeholder="08012345678"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Family Info */}
      {step === 2 && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Family Information</h3>
          <p className={styles.formCardDesc}>Enter the names of your parents</p>

          <div className="form-group">
            <label htmlFor="fatherName" className="form-label form-label-required">Father&apos;s Full Name</label>
            <input
              type="text"
              id="fatherName"
              className="form-input"
              placeholder="Enter father's full name"
              value={formData.fatherName}
              onChange={e => updateField('fatherName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="motherName" className="form-label form-label-required">Mother&apos;s Full Name</label>
            <input
              type="text"
              id="motherName"
              className="form-input"
              placeholder="Enter mother's full name (maiden name)"
              value={formData.motherName}
              onChange={e => updateField('motherName', e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {/* Step 3: Origin Details */}
      {step === 3 && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Origin Information</h3>
          <p className={styles.formCardDesc}>Enter your certificate details</p>

          <div className="form-group">
            <label htmlFor="nativeOf" className="form-label form-label-required">Native Of (Village/Community)</label>
            <input
              type="text"
              id="nativeOf"
              className="form-input"
              placeholder="e.g. Umuoba, Egbu"
              value={formData.nativeOf}
              onChange={e => updateField('nativeOf', e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className="form-group">
              <label htmlFor="lga" className="form-label form-label-required">Local Government Area</label>
              <input
                type="text"
                id="lga"
                className="form-input"
                placeholder="e.g. Owerri Municipal"
                value={formData.lga}
                onChange={e => updateField('lga', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="stateOfOrigin" className="form-label form-label-required">State of Origin</label>
              <input
                type="text"
                id="stateOfOrigin"
                className="form-input"
                placeholder="e.g. Imo State"
                value={formData.stateOfOrigin}
                onChange={e => updateField('stateOfOrigin', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purpose" className="form-label form-label-required">Purpose of Certificate</label>
            <textarea
              id="purpose"
              className="form-textarea"
              placeholder="e.g. Employment, Education, Passport Application"
              value={formData.purpose}
              onChange={e => updateField('purpose', e.target.value)}
              required
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Review Your Application</h3>
          <p className={styles.formCardDesc}>Please verify all details before submitting</p>

          <div className={styles.reviewSection}>
            <div className={styles.reviewTitle}>Personal Details</div>
            <div className={styles.reviewGrid}>
              <span className={styles.reviewLabel}>Full Name</span>
              <span className={styles.reviewValue}>{formData.fullName}</span>
              <span className={styles.reviewLabel}>Date of Birth</span>
              <span className={styles.reviewValue}>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
              {formData.phone && (
                <>
                  <span className={styles.reviewLabel}>Phone</span>
                  <span className={styles.reviewValue}>{formData.phone}</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.reviewDivider} style={{ marginBottom: 'var(--space-4)' }} />

          <div className={styles.reviewSection}>
            <div className={styles.reviewTitle}>Family Information</div>
            <div className={styles.reviewGrid}>
              <span className={styles.reviewLabel}>Father&apos;s Name</span>
              <span className={styles.reviewValue}>{formData.fatherName}</span>
              <span className={styles.reviewLabel}>Mother&apos;s Name</span>
              <span className={styles.reviewValue}>{formData.motherName}</span>
            </div>
          </div>

          <div className={styles.reviewDivider} style={{ marginBottom: 'var(--space-4)' }} />

          <div className={styles.reviewSection}>
            <div className={styles.reviewTitle}>Origin Information</div>
            <div className={styles.reviewGrid}>
              <span className={styles.reviewLabel}>Native Of</span>
              <span className={styles.reviewValue}>{formData.nativeOf}</span>
              <span className={styles.reviewLabel}>LGA</span>
              <span className={styles.reviewValue}>{formData.lga}</span>
              <span className={styles.reviewLabel}>State of Origin</span>
              <span className={styles.reviewValue}>{formData.stateOfOrigin}</span>
              <span className={styles.reviewLabel}>Purpose</span>
              <span className={styles.reviewValue}>{formData.purpose}</span>
            </div>
          </div>

          <div className={styles.feeBox}>
            <span className={styles.feeLabel}>Certificate Fee</span>
            <span className={styles.feeValue}>₦{CERTIFICATE_FEE.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={styles.formActions}>
        <div>
          {step > 1 && (
            <button className="btn btn-ghost" onClick={prevStep} disabled={loading}>
              ← Previous
            </button>
          )}
        </div>
        <div className={styles.formActionsRight}>
          {step < totalSteps && (
            <button className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          )}
          {step === totalSteps && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
