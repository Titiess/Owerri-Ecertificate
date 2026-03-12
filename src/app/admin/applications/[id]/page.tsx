'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';

interface ApplicationFile {
  id: string;
  type: string;
  fileUrl: string;
}

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
  files?: ApplicationFile[];
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const { data, error: swrError, isLoading: loading, mutate: fetchApp } = useSWR(`/api/applications/${params.id}`, fetcher);
  const app: ApplicationDetail | null = data?.success ? data.data : null;
  const error = swrError ? 'Failed to fetch application.' : (!data?.success && data?.error ? data.error : '');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  async function handleApprove() {
    if (!app || !confirm('Are you sure you want to approve this application?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchApp();
      } else {
        alert(data.error || 'Failed to approve application.');
      }
    } catch { 
      alert('Failed to approve application due to an internal error.'); 
    } finally { 
      setActionLoading(false); 
    }
  }

  async function handleReject() {
    if (!app || !rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setRejectReason('');
        fetchApp();
      } else {
        alert(data.error || 'Failed to reject application.');
      }
    } catch { 
      alert('Failed to reject application due to an internal error.'); 
    } finally { 
      setActionLoading(false); 
    }
  }

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
        <Link href="/admin/applications" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link href="/admin/applications" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', textDecoration: 'none' }}>
        ← Back to Applications List
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
          {app.status === 'PENDING_REVIEW' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleApprove} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                Reject
              </button>
            </>
          )}
          {app.certificatePdfUrl && (
            <a href={app.certificatePdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              View Certificate
            </a>
          )}
        </div>
      </div>

      {/* Rejection modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200, padding: 'var(--space-4)',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Reject Application</h3>
            <div className="form-group">
              <label className="form-label form-label-required">Reason for Rejection</label>
              <textarea
                className="form-textarea"
                placeholder="Provide a clear reason for rejecting this application..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                disabled={actionLoading}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowRejectModal(false); setRejectReason(''); }} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection reason display */}
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

        {/* Supporting Documents (Files) */}
        {app.files && app.files.length > 0 && (
          <div className={styles.detailCard}>
            <div className={styles.detailCardTitle}>Supporting Documents</div>
            {app.files.map(file => (
              <div key={file.id} className={styles.detailRow} style={{ alignItems: 'center' }}>
                <span className={styles.detailLabel}>{file.type.replace(/_/g, ' ')}</span>
                <span className={styles.detailValue}>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" style={{ padding: '4px 8px' }}>
                    View File
                  </a>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Payment & Certificate Info */}
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>Status & Certificate</div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Payment</span>
            <span className={styles.detailValue} style={{ color: app.paymentStatus === 'CONFIRMED' ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {app.paymentStatus === 'CONFIRMED' ? 'Confirmed' : app.paymentStatus === 'FAILED' ? 'Failed' : 'Pending'}
            </span>
          </div>
          {app.paymentReference && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Bank Ref</span>
              <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{app.paymentReference}</span>
            </div>
          )}
          <div className={styles.detailRow} style={{ marginTop: '12px' }} />
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
          {app.approvedBy && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Approved By</span>
              <span className={styles.detailValue}>{app.approvedBy.name}</span>
            </div>
          )}
          {app.hash && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cert Hash</span>
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
