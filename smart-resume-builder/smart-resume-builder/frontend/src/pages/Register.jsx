import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type, placeholder) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        required
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📄</div>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Build your perfect resume with AI assistance</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {field('name', 'Full name', 'text', 'Your name')}
          {field('email', 'Email', 'email', 'you@email.com')}
          {field('password', 'Password', 'password', 'At least 6 characters')}
          {field('confirm', 'Confirm password', 'password', 'Repeat your password')}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
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
    marginTop: '0.5rem'
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--gray-500)',
    marginTop: '1.5rem'
  }
};
