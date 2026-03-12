'use client';

import { useEffect, useState, Suspense } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '@/styles/dashboard.module.css';

interface AppItem {
  id: string;
  referenceNo: string;
  applicantName: string;
  nativeOf: string;
  stateOfOrigin: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  applicant?: { email: string; phone: string };
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

function AdminApplicationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get('status') || 'ALL';
  
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const [filter, setFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/applications?status=${filter}&search=${search}`, fetcher);
  const apps = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const loading = isLoading;

  async function fetchApps() {
    mutate();
  }

  async function handleApprove(id: string) {
    if (!confirm('Are you sure you want to approve this application?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchApps();
      } else {
        alert(data.error);
      }
    } catch { alert('Failed to approve'); }
    finally { setActionLoading(null); }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectId(null);
        setRejectReason('');
        fetchApps();
      } else {
        alert(data.error);
      }
    } catch { alert('Failed to reject'); }
    finally { setActionLoading(null); }
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.dashTopBar}>
        <div>
          <h1 className={styles.dashWelcome}>Applications</h1>
          <p className={styles.dashWelcomeSub}>{total} total applications</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PAYMENT_PENDING'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}
            style={{ minHeight: '36px' }}
          >
            {s === 'ALL' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <form onSubmit={e => { e.preventDefault(); fetchApps(); }} style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ height: '36px', fontSize: 'var(--text-sm)', maxWidth: '240px' }}
          />
          <button type="submit" className="btn btn-sm btn-secondary">Search</button>
        </form>
      </div>

      {/* Rejection modal */}
      {rejectId && (
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
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setRejectId(null); setRejectReason(''); }}>
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleReject(rejectId)}
                disabled={actionLoading === rejectId}
              >
                {actionLoading === rejectId ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : apps.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No Applications Found</h3>
          <p className={styles.emptyText}>
            {filter !== 'ALL' ? 'No applications match the current filter.' : 'No applications have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Origin</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app: AppItem) => (
                <tr key={app.id}>
                  <td>
                    <span className="text-mono" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      {app.referenceNo}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.applicantName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                      {app.applicant?.email}
                    </div>
                  </td>
                  <td>{app.nativeOf}, {app.stateOfOrigin}</td>
                  <td>
                    <span className={getStatusBadgeClass(app.status)}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(app.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {app.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleApprove(app.id)}
                            disabled={actionLoading === app.id}
                            style={{ minHeight: '32px', fontSize: 'var(--text-xs)' }}
                          >
                            {actionLoading === app.id ? '...' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setRejectId(app.id)}
                            style={{ minHeight: '32px', fontSize: 'var(--text-xs)' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                        style={{ minHeight: '32px', fontSize: 'var(--text-xs)' }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    }>
      <AdminApplicationsContent />
    </Suspense>
  );
}
