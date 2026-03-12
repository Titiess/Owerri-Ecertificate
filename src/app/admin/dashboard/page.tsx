'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';

interface Stats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  totalRevenue: number;
  thisMonth: { applications: number; approved: number; revenue: number };
}

export default function AdminDashboardPage() {
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher);
  
  const stats = data?.data || null;
  const loading = isLoading;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.dashTopBar}>
        <div>
          <h1 className={styles.dashWelcome}>Admin Dashboard</h1>
          <p className={styles.dashWelcomeSub}>Overview of certificate applications</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
              <div className={styles.statLabel}>Total Applications</div>
              <div className={styles.statValue}>{stats.totalApplications}</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardWarning}`}>
              <div className={styles.statLabel}>Pending Review</div>
              <div className={styles.statValue}>{stats.pendingReview}</div>
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

          {/* Revenue and this month */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="card card-gold">
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: 'var(--space-3)' }}>
                Total Revenue
              </h4>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-secondary)' }}>
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="card card-accent">
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: 'var(--space-3)' }}>
                This Month
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>Applications</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>{stats.thisMonth.applications}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>Approved</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-success)' }}>{stats.thisMonth.approved}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>Revenue</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-secondary)' }}>₦{stats.thisMonth.revenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <Link href="/admin/applications?status=PENDING_REVIEW" className="btn btn-primary">
          Review Pending ({stats?.pendingReview || 0})
        </Link>
        <Link href="/admin/applications" className="btn btn-secondary">
          View All Applications
        </Link>
      </div>
    </div>
  );
}
