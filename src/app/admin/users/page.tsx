'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/dashboard.module.css';

interface AdminUser {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowForm(false);
        setFormData({ name: '', username: '', password: '' });
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to create admin');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this admin user? They will immediately lose access.')) return;
    
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Network error');
    }
  }

  if (loading) {
    return <div className="spinner spinner-lg" style={{ margin: '80px auto' }} />;
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.dashTopBar}>
        <div>
          <h1 className={styles.dashWelcome}>Manage Admins</h1>
          <p className={styles.dashWelcomeSub}>Appoint and remove up to 10 admin users to process applications.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          disabled={admins.length >= 10}
        >
          {showForm ? 'Cancel' : '+ Appoint New Admin'}
        </button>
      </div>

      {admins.length >= 10 && !showForm && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-warning-subtle)', color: 'var(--color-warning-dark)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          You have reached the maximum limit of 10 admin users. Remove an existing admin to add a new one.
        </div>
      )}

      {showForm && (
        <div className="card card-accent" style={{ marginBottom: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create Admin Account</h3>
          {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}
          
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '500px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Active Admins ({admins.length}/10)</h3>
        {admins.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-500)' }}>No active admins found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-neutral-200)' }}>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-neutral-500)', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-neutral-500)', fontWeight: 600 }}>Username</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-neutral-500)', fontWeight: 600 }}>Added On</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-neutral-500)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <td style={{ padding: 'var(--space-3)' }}>{admin.name}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{admin.username}</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--color-neutral-500)' }}>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <button 
                        onClick={() => handleDelete(admin.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
