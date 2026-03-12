'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';
import type { Application } from '@prisma/client';

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DashboardPage() {
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, error, isLoading } = useSWR('/api/applications', fetcher);
  
  const applications: Application[] = data?.data || [];
  const loading = isLoading;

  const stats = {
    total: applications.length,
    pending: applications.filter((a: Application) => a.status === 'PENDING_REVIEW' || a.status === 'PAYMENT_PENDING').length,
    approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
    rejected: applications.filter((a: Application) => a.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className={styles.dashTopBar}>
        <div>
          <h1 className={styles.dashWelcome}>My Dashboard</h1>
          <p className={styles.dashWelcomeSub}>Manage your certificate applications</p>
        </div>
        <Link href="/dashboard/apply" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
          <div className={styles.statLabel}>Total Applications</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardWarning}`}>
          <div className={styles.statLabel}>Pending</div>
          <div className={styles.statValue}>{stats.pending}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
          <div className={styles.statLabel}>Approved</div>
          <div className={styles.statValue}>{stats.approved}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardError}`}>
          <div className={styles.statLabel}>Rejected</div>
          <div className={styles.statValue}>{stats.rejected}</div>
        </div>
      </div>

      {/* Applications list */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Applications</h2>
      </div>

      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No Applications Yet</h3>
          <p className={styles.emptyText}>
            You haven&apos;t submitted any certificate applications. 
            Start your first application to get your Certificate of Origin.
          </p>
          <Link href="/dashboard/apply" className="btn btn-primary">
            Start Application
          </Link>
        </div>
      ) : (
        <div className={styles.appList}>
          {applications.map((app: Application) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className={styles.appCard}
            >
              <div className={styles.appCardMain}>
                <div className={styles.appRef}>{app.referenceNo}</div>
                <div className={styles.appName}>{app.applicantName}</div>
                <div className={styles.appMeta}>
                  {formatDate(app.createdAt.toString())} · {app.nativeOf}, {app.stateOfOrigin}
                </div>
              </div>
              <span className={getStatusBadgeClass(app.status)}>
                {getStatusLabel(app.status)}
              </span>
              <span className={styles.appCardArrow}>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
