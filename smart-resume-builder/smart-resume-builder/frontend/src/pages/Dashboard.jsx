import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.resumes);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    setCreating(true);
    try {
      const res = await api.post('/resumes', {
        title: 'My Resume',
        personal: { name: user?.name || '', email: user?.email || '' },
        experience: [{ title: '', company: '', duration: '', description: '' }],
        education: [{ degree: '', school: '', duration: '', gpa: '' }],
        projects: [{ name: '', tech: '', description: '', link: '' }],
        certifications: [{ name: '', issuer: '', date: '' }]
      });
      navigate(`/builder/${res.data.resume._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  const fmt = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const themeColors = { classic: '#1a1a1a', modern: '#2563eb', minimal: '#6b7280' };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <span style={styles.navBrand}>📄 Resume Builder</span>
          <div style={styles.navRight}>
            <span style={styles.navUser}>Hi, {user?.name?.split(' ')[0]}</span>
            <button onClick={logout} style={styles.navBtn}>Sign out</button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.h1}>Your resumes</h1>
            <p style={styles.subtitle}>{resumes.length} resume{resumes.length !== 1 ? 's' : ''} · max 10</p>
          </div>
          <button onClick={createResume} disabled={creating} style={styles.createBtn}>
            {creating ? 'Creating...' : '+ New resume'}
          </button>
        </div>

        {loading ? (
          <div style={styles.empty}>
            <p style={{ color: 'var(--gray-400)' }}>Loading...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>No resumes yet</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: '14px' }}>
              Create your first resume and get AI-powered suggestions.
            </p>
            <button onClick={createResume} disabled={creating} style={styles.createBtn}>
              {creating ? 'Creating...' : 'Create your first resume'}
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {resumes.map(r => (
              <div
                key={r._id}
                style={styles.card}
                onClick={() => navigate(`/builder/${r._id}`)}
              >
                <div style={{ ...styles.cardAccent, background: themeColors[r.theme] || '#1a1a1a' }} />
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardIcon}>📄</div>
                    <button
                      onClick={(e) => deleteResume(r._id, e)}
                      style={styles.deleteBtn}
                      title="Delete resume"
                    >✕</button>
                  </div>
                  <h3 style={styles.cardTitle}>{r.title || 'Untitled Resume'}</h3>
                  {r.personal?.name && (
                    <p style={styles.cardName}>{r.personal.name}</p>
                  )}
                  <div style={styles.cardMeta}>
                    <span style={styles.themeBadge}>{r.theme || 'classic'}</span>
                    <span style={styles.cardDate}>Updated {fmt(r.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--gray-50)' },
  nav: {
    background: 'white',
    borderBottom: '1px solid var(--gray-200)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navBrand: { fontSize: '16px', fontWeight: '700', color: 'var(--gray-900)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  navUser: { fontSize: '14px', color: 'var(--gray-600)' },
  navBtn: {
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    color: 'var(--gray-700)'
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  h1: { fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--gray-500)' },
  createBtn: {
    padding: '10px 20px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '600'
  },
  empty: { textAlign: 'center', padding: '4rem' },
  emptyCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--gray-200)',
    padding: '3rem',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem'
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--gray-200)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.15s',
    boxShadow: 'var(--shadow-sm)'
  },
  cardAccent: { height: '4px' },
  cardBody: { padding: '1.25rem' },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  cardIcon: { fontSize: '1.5rem' },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--gray-400)',
    fontSize: '14px',
    padding: '4px 6px',
    borderRadius: 'var(--radius-sm)'
  },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '4px' },
  cardName: { fontSize: '13px', color: 'var(--gray-500)', marginBottom: '0.75rem' },
  cardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  themeBadge: {
    background: 'var(--gray-100)',
    color: 'var(--gray-600)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  cardDate: { fontSize: '11px', color: 'var(--gray-400)' }
};
