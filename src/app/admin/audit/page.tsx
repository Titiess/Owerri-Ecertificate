'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/dashboard.module.css';

interface AuditEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  timestamp: string;
  user: { name: string; username: string; role: string } | null;
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/admin/audit');
        const data = await res.json();
        if (data.success) {
          setLogs(data.data.items);
          setTotal(data.data.total);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className={styles.dashTopBar}>
        <div>
          <h1 className={styles.dashWelcome}>Audit Log</h1>
          <p className={styles.dashWelcomeSub}>{total} total entries — every admin action is recorded</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📜</div>
          <h3 className={styles.emptyTitle}>No Audit Logs</h3>
          <p className={styles.emptyText}>No actions have been recorded yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {new Date(log.timestamp).toLocaleString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      background: log.action.includes('APPROVED') ? 'var(--color-success-light)' :
                                  log.action.includes('REJECTED') ? 'var(--color-error-light)' :
                                  log.action.includes('PAYMENT') ? 'var(--color-warning-light)' :
                                  'var(--color-info-light)',
                      color: log.action.includes('APPROVED') ? 'var(--color-success)' :
                             log.action.includes('REJECTED') ? 'var(--color-error)' :
                             log.action.includes('PAYMENT') ? 'var(--color-warning)' :
                             'var(--color-info)',
                    }}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td>
                    {log.user ? (
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{log.user.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>{log.user.role}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>System</span>
                    )}
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>
                    {log.resourceType}
                    {log.resourceId && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                        {log.resourceId.substring(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                    {log.ipAddress || '—'}
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    {log.details ? (
                      <details style={{ fontSize: 'var(--text-xs)' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--color-primary)' }}>View</summary>
                        <pre style={{
                          fontSize: 'var(--text-xs)',
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          marginTop: 'var(--space-1)',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : '—'}
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
