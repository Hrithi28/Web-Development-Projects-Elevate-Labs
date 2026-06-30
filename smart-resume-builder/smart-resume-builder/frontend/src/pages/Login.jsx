import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📄</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your Resume Builder account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--gray-50)',
    padding: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px'
  },
  logo: { fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center',
    color: 'var(--gray-900)',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--gray-500)',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--gray-700)' },
  input: {
    padding: '10px 14px',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%'
  },
  btn: {
    padding: '11px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '0.5rem',
    transition: 'background 0.15s'
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--gray-500)',
    marginTop: '1.5rem'
  }
};
