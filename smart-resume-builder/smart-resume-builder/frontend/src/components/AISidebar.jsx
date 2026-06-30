import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AISidebar({ resumeId, data, onApplySummary }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);

  const getSuggestions = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/suggestions', { resumeId });
      setResult(res.data.suggestions);
      setScore(res.data.score);
    } catch (err) {
      const msg = err.response?.data?.error || 'AI service unavailable';
      toast.error(msg);
      setResult(`⚠️ ${msg}\n\nMake sure your OPENAI_API_KEY is set in the backend .env file.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.title}>✨ AI Resume Coach</div>
        <div style={styles.subtitle}>Powered by GPT-3.5</div>
      </div>

      {score !== null && (
        <div style={styles.scoreCard}>
          <div style={styles.scoreNum}>{score}<span style={{ fontSize: '14px' }}>%</span></div>
          <div style={styles.scoreLabel}>Resume strength</div>
          <div style={styles.scoreBar}>
            <div style={{
              height: '100%',
              width: score + '%',
              background: score > 70 ? '#16a34a' : score > 40 ? '#d97706' : '#dc2626',
              borderRadius: '3px',
              transition: 'width 0.5s'
            }} />
          </div>
        </div>
      )}

      <button onClick={getSuggestions} disabled={loading} style={styles.analyzeBtn}>
        {loading ? 'Analyzing...' : '🔍 Analyze my resume'}
      </button>

      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.loadingText}>Claude is reading your resume...</div>
          <div style={styles.dots}>
            <span style={styles.dot} />
            <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
            <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {result && !loading && (
        <div style={styles.resultBox}>
          <div style={styles.resultTitle}>Suggestions</div>
          <div style={styles.resultText}>{result}</div>
        </div>
      )}

      <div style={styles.tips}>
        <div style={styles.tipsTitle}>Quick tips</div>
        {[
          'Use strong action verbs (Built, Led, Optimized, Delivered)',
          'Add metrics to show impact (40% faster, 3x growth)',
          'Tailor skills to each job description',
          'Keep bullet points concise — 1-2 lines each',
          'Put most recent experience first',
          'Include relevant links (GitHub, LinkedIn, Portfolio)'
        ].map((tip, i) => (
          <div key={i} style={styles.tip}>
            <span style={styles.tipIcon}>→</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

const styles = {
  root: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' },
  title: { fontSize: '15px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '2px' },
  subtitle: { fontSize: '11px', color: 'var(--gray-400)' },
  scoreCard: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem', textAlign: 'center' },
  scoreNum: { fontSize: '28px', fontWeight: '700', color: '#1d4ed8' },
  scoreLabel: { fontSize: '12px', color: '#3b82f6', marginTop: '2px', marginBottom: '8px' },
  scoreBar: { height: '6px', background: '#dbeafe', borderRadius: '3px', overflow: 'hidden' },
  analyzeBtn: { width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  loadingBox: { background: 'var(--gray-50)', borderRadius: '8px', padding: '1rem', textAlign: 'center' },
  loadingText: { fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' },
  dots: { display: 'flex', justifyContent: 'center', gap: '6px' },
  dot: { width: '6px', height: '6px', background: '#2563eb', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' },
  resultBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' },
  resultTitle: { fontSize: '12px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' },
  resultText: { fontSize: '12px', color: '#166534', lineHeight: '1.7', whiteSpace: 'pre-line' },
  tips: { background: 'var(--gray-50)', borderRadius: '10px', padding: '1rem' },
  tipsTitle: { fontSize: '12px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '8px' },
  tip: { display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--gray-600)', marginBottom: '6px', lineHeight: '1.5' },
  tipIcon: { color: '#2563eb', flexShrink: 0, fontWeight: '700' }
};
