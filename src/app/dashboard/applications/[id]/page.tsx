'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';

interface ApplicationDetail {
  id: string;
  referenceNo: string;
  applicantName: string;
  dateOfBirth: string;
  nativeOf: string;
  lga: string;
  stateOfOrigin: string;
  fatherName: string;
  motherName: string;
  purpose: string;
  certificateType: string;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  paidAt: string | null;
  rejectionReason: string | null;
  hash: string | null;
  certificatePdfUrl: string | null;
  approvedAt: string | null;
  createdAt: string;
  approvedBy?: { name: string } | null;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PAYMENT_PENDING': return 'badge badge-pending-payment';
    case 'PENDING_REVIEW': return 'badge badge-pending-review';
    case 'APPROVED': return 'badge badge-approved';
    case 'REJECTED': return 'badge badge-rejected';
    default: return 'badge';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PAYMENT_PENDING': return 'Payment Pending';
    case 'PENDING_REVIEW': return 'Under Review';
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    default: return status;
  }
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, error: swrError, isLoading } = useSWR(`/api/applications/${params.id}`, fetcher);
  
  const app = data?.data || null;
  const loading = isLoading;
  const error = swrError ? 'Failed to fetch application.' : (!data?.success && data?.error ? data.error : '');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>❌</div>
        <h3 className={styles.emptyTitle}>{error || 'Application Not Found'}</h3>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className={styles.detailHeader} style={{ marginTop: 'var(--space-4)' }}>
        <div>
          <span className={styles.detailRef}>{app.referenceNo}</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)' }}>
            {app.applicantName}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <span className={getStatusBadgeClass(app.status)}>
            {getStatusLabel(app.status)}
          </span>
          {app.status === 'PAYMENT_PENDING' && (
            <Link href={`/dashboard/applications/${app.id}/pay`} className="btn btn-primary btn-sm">
              Pay Now
            </Link>
          )}
          {app.status === 'APPROVED' && app.hash && (
            <>
              <Link href={`/certificate/${app.hash}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                View Certificate
              </Link>
              <a href={`/certificate/${app.hash}?print=true`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Print / Download Certificate
              </a>
            </>
          )}
        </div>
      </div>

      {/* Rejection reason */}
      {app.status === 'REJECTED' && app.rejectionReason && (
        <div className={styles.rejectionBox}>
          <div className={styles.rejectionTitle}>Rejection Reason</div>
          <p className={styles.rejectionText}>{app.rejectionReason}</p>
        </div>
      )}

      {/* Detail cards */}
      <div className={styles.detailGrid} style={{ marginTop: 'var(--space-6)' }}>
        {/* Personal Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Personal Information</div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Full Name</span>
            <span className={styles.detailValue}>{app.applicantName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date of Birth</span>
            <span className={styles.detailValue}>{formatDate(app.dateOfBirth)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Father&apos;s Name</span>
            <span className={styles.detailValue}>{app.fatherName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Mother&apos;s Name</span>
            <span className={styles.detailValue}>{app.motherName}</span>
          </div>
        </div>

        {/* Origin Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Origin Information</div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Native Of</span>
            <span className={styles.detailValue}>{app.nativeOf}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>LGA</span>
            <span className={styles.detailValue}>{app.lga}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>State of Origin</span>
            <span className={styles.detailValue}>{app.stateOfOrigin}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Purpose</span>
            <span className={styles.detailValue}>{app.purpose}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Payment</div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue} style={{ color: app.paymentStatus === 'CONFIRMED' ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {app.paymentStatus === 'CONFIRMED' ? 'Paid' : app.paymentStatus === 'FAILED' ? 'Failed' : 'Pending'}
            </span>
          </div>
          {app.paymentReference && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Reference</span>
              <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{app.paymentReference}</span>
            </div>
          )}
          {app.paidAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Paid On</span>
              <span className={styles.detailValue}>{formatDate(app.paidAt)}</span>
            </div>
          )}
        </div>

        {/* Certificate Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Certificate</div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Type</span>
            <span className={styles.detailValue}>Certificate of Origin</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Submitted</span>
            <span className={styles.detailValue}>{formatDate(app.createdAt)}</span>
          </div>
          {app.approvedAt && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Approved On</span>
              <span className={styles.detailValue}>{formatDate(app.approvedAt)}</span>
            </div>
          )}
          {app.hash && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Certificate Hash</span>
              <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
                {app.hash.substring(0, 16)}...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
