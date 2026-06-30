import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import AISidebar from '../components/AISidebar';

const uid = () => Math.random().toString(36).slice(2, 8);

const EMPTY_EXP = () => ({ id: uid(), title: '', company: '', location: '', duration: '', description: '' });
const EMPTY_EDU = () => ({ id: uid(), degree: '', school: '', location: '', duration: '', gpa: '' });
const EMPTY_PROJ = () => ({ id: uid(), name: '', tech: '', description: '', link: '' });
const EMPTY_CERT = () => ({ id: uid(), name: '', issuer: '', date: '' });

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certs', label: 'Certifications' }
];

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('personal');
  const [showAI, setShowAI] = useState(false);
  const [score, setScore] = useState(0);
  const saveTimer = useRef(null);

  useEffect(() => {
    api.get(`/resumes/${id}`)
      .then(res => {
        const r = res.data.resume;
        if (!r.experience?.length) r.experience = [EMPTY_EXP()];
        if (!r.education?.length) r.education = [EMPTY_EDU()];
        if (!r.projects?.length) r.projects = [EMPTY_PROJ()];
        if (!r.certifications?.length) r.certifications = [EMPTY_CERT()];
        r.experience = r.experience.map(e => ({ id: uid(), ...e }));
        r.education = r.education.map(e => ({ id: uid(), ...e }));
        r.projects = r.projects.map(e => ({ id: uid(), ...e }));
        r.certifications = r.certifications.map(e => ({ id: uid(), ...e }));
        setData(r);
      })
      .catch(() => { toast.error('Resume not found'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!data) return;
    let s = 0;
    if (data.personal?.name) s += 15;
    if (data.personal?.email) s += 10;
    if (data.personal?.phone) s += 5;
    if (data.personal?.linkedin) s += 5;
    if (data.summary?.length > 50) s += 20;
    if (data.experience?.some(e => e.title && e.description)) s += 25;
    if (data.education?.some(e => e.degree && e.school)) s += 10;
    if (data.skills) s += 5;
    if (data.projects?.some(p => p.name)) s += 5;
    setScore(Math.min(s, 100));
  }, [data]);

  const autoSave = useCallback((newData) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.put(`/resumes/${id}`, newData);
      } catch {
        toast.error('Auto-save failed');
      } finally {
        setSaving(false);
      }
    }, 1500);
  }, [id]);

  const update = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      autoSave(next);
      return next;
    });
  };

  const updateArr = (arr, idx, field, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[arr][idx][field] = value;
      autoSave(next);
      return next;
    });
  };

  const addItem = (arr, template) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[arr] = [...(next[arr] || []), template()];
      autoSave(next);
      return next;
    });
  };

  const removeItem = (arr, idx) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[arr].splice(idx, 1);
      autoSave(next);
      return next;
    });
  };

  const exportPDF = async () => {
    try {
      const res = await api.get(`/pdf/${id}`, { responseType: 'text' });
      const w = window.open('', '_blank');
      w.document.write(res.data);
      w.document.close();
      setTimeout(() => w.print(), 800);
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '14px', color: '#6b7280' }}>Loading resume...</div>;
  if (!data) return null;

  return (
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.topLeft}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Dashboard</button>
          <input
            value={data.title || ''}
            onChange={e => update('title', e.target.value)}
            style={styles.titleInput}
            placeholder="Resume title"
          />
          <span style={styles.saveStatus}>{saving ? 'Saving...' : 'Saved'}</span>
        </div>
        <div style={styles.topRight}>
          <div style={styles.scoreWrap}>
            <span style={styles.scoreLabel}>{score}%</span>
            <div style={styles.scoreBar}>
              <div style={{ ...styles.scoreFill, width: score + '%', background: score > 70 ? '#16a34a' : score > 40 ? '#d97706' : '#dc2626' }} />
            </div>
          </div>
          <select value={data.theme || 'classic'} onChange={e => update('theme', e.target.value)} style={styles.themeSelect}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
          <button onClick={() => setShowAI(s => !s)} style={{ ...styles.topBtn, background: showAI ? '#eff6ff' : 'transparent', color: showAI ? '#2563eb' : '#374151', borderColor: showAI ? '#2563eb' : '#d1d5db' }}>
            ✨ AI tips
          </button>
          <button onClick={exportPDF} style={styles.pdfBtn}>Export PDF</button>
        </div>
      </div>

      <div style={styles.body}>
        {/* Left editor panel */}
        <div style={styles.editorPanel}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={styles.editorBody}>
            {tab === 'personal' && <PersonalTab data={data.personal} update={update} />}
            {tab === 'summary' && <SummaryTab data={data} update={update} resumeId={id} />}
            {tab === 'experience' && <ExperienceTab data={data.experience} updateArr={updateArr} addItem={addItem} removeItem={removeItem} resumeId={id} />}
            {tab === 'education' && <EducationTab data={data.education} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />}
            {tab === 'skills' && <SkillsTab skills={data.skills} update={update} />}
            {tab === 'projects' && <ProjectsTab data={data.projects} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />}
            {tab === 'certs' && <CertsTab data={data.certifications} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />}
          </div>
        </div>

        {/* Preview */}
        <div style={styles.previewPanel}>
          <ResumePreview data={data} />
        </div>

        {/* AI Sidebar */}
        {showAI && (
          <div style={styles.aiPanel}>
            <AISidebar resumeId={id} data={data} onApplySummary={(s) => update('summary', s)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components for each tab ────────────────────────────────────────

function Field({ label, children, half }) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s.input} />;
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s.textarea} />;
}

function PersonalTab({ data, update }) {
  const u = (k) => (v) => update(`personal.${k}`, v);
  return (
    <div style={s.grid}>
      <Field label="Full name"><Input value={data?.name} onChange={u('name')} placeholder="Your full name" /></Field>
      <Field label="Email" half><Input value={data?.email} onChange={u('email')} placeholder="you@email.com" type="email" /></Field>
      <Field label="Phone" half><Input value={data?.phone} onChange={u('phone')} placeholder="+91 98765 43210" /></Field>
      <Field label="Location" half><Input value={data?.location} onChange={u('location')} placeholder="City, India" /></Field>
      <Field label="LinkedIn" half><Input value={data?.linkedin} onChange={u('linkedin')} placeholder="linkedin.com/in/you" /></Field>
      <Field label="Portfolio / GitHub"><Input value={data?.portfolio} onChange={u('portfolio')} placeholder="github.com/you" /></Field>
    </div>
  );
}

function SummaryTab({ data, update, resumeId }) {
  const [improving, setImproving] = useState(false);

  const improveSummary = async () => {
    setImproving(true);
    try {
      const res = await api.post('/ai/improve-summary', { resumeId });
      update('summary', res.data.improvedSummary);
      toast.success('Summary improved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI unavailable');
    } finally {
      setImproving(false);
    }
  };

  return (
    <div>
      <Textarea
        value={data.summary}
        onChange={v => update('summary', v)}
        placeholder="A compelling 2-3 sentence professional summary highlighting your experience, key skills, and value proposition..."
        rows={6}
      />
      <button onClick={improveSummary} disabled={improving} style={s.aiBtn}>
        {improving ? 'Improving...' : '✨ Improve with AI'}
      </button>
    </div>
  );
}

function ExperienceTab({ data, updateArr, addItem, removeItem, resumeId }) {
  const [improving, setImproving] = useState(null);

  const improveDesc = async (idx) => {
    const ex = data[idx];
    setImproving(idx);
    try {
      const res = await api.post('/ai/improve-description', {
        description: ex.description,
        jobTitle: ex.title,
        company: ex.company
      });
      updateArr('experience', idx, 'description', res.data.improvedDescription);
      toast.success('Description improved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI unavailable');
    } finally {
      setImproving(null);
    }
  };

  return (
    <div>
      {data.map((ex, idx) => (
        <div key={ex.id || idx} style={s.entryCard}>
          <div style={s.entryHeader}>
            <span style={s.entryNum}>Experience {idx + 1}</span>
            {data.length > 1 && (
              <button onClick={() => removeItem('experience', idx)} style={s.removeBtn}>Remove</button>
            )}
          </div>
          <div style={s.grid}>
            <Field label="Job title" half><Input value={ex.title} onChange={v => updateArr('experience', idx, 'title', v)} placeholder="Software Engineer" /></Field>
            <Field label="Company" half><Input value={ex.company} onChange={v => updateArr('experience', idx, 'company', v)} placeholder="Acme Corp" /></Field>
            <Field label="Location" half><Input value={ex.location} onChange={v => updateArr('experience', idx, 'location', v)} placeholder="City / Remote" /></Field>
            <Field label="Duration" half><Input value={ex.duration} onChange={v => updateArr('experience', idx, 'duration', v)} placeholder="Jan 2024 – Present" /></Field>
            <Field label="Description (bullet points work best)">
              <Textarea value={ex.description} onChange={v => updateArr('experience', idx, 'description', v)} placeholder={`• Built REST APIs using Node.js and Express\n• Reduced latency by 40% through query optimization\n• Mentored 2 junior developers`} rows={5} />
              <button onClick={() => improveDesc(idx)} disabled={improving === idx} style={s.aiBtn}>
                {improving === idx ? 'Improving...' : '✨ Improve bullets with AI'}
              </button>
            </Field>
          </div>
        </div>
      ))}
      <button onClick={() => addItem('experience', EMPTY_EXP)} style={s.addBtn}>+ Add experience</button>
    </div>
  );
}

function EducationTab({ data, updateArr, addItem, removeItem }) {
  return (
    <div>
      {data.map((ed, idx) => (
        <div key={ed.id || idx} style={s.entryCard}>
          <div style={s.entryHeader}>
            <span style={s.entryNum}>Education {idx + 1}</span>
            {data.length > 1 && <button onClick={() => removeItem('education', idx)} style={s.removeBtn}>Remove</button>}
          </div>
          <div style={s.grid}>
            <Field label="Degree / Program" half><Input value={ed.degree} onChange={v => updateArr('education', idx, 'degree', v)} placeholder="B.Tech Computer Science" /></Field>
            <Field label="School / University" half><Input value={ed.school} onChange={v => updateArr('education', idx, 'school', v)} placeholder="XYZ University" /></Field>
            <Field label="Duration" half><Input value={ed.duration} onChange={v => updateArr('education', idx, 'duration', v)} placeholder="2022 – 2026" /></Field>
            <Field label="GPA / Score" half><Input value={ed.gpa} onChange={v => updateArr('education', idx, 'gpa', v)} placeholder="8.5 / 10" /></Field>
          </div>
        </div>
      ))}
      <button onClick={() => addItem('education', EMPTY_EDU)} style={s.addBtn}>+ Add education</button>
    </div>
  );
}

function SkillsTab({ skills, update }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
        Enter skills separated by commas. These appear as tags on your resume.
      </p>
      <Textarea
        value={skills}
        onChange={v => update('skills', v)}
        placeholder="React.js, Node.js, Python, SQL, Docker, Git, REST APIs, MongoDB, Machine Learning, TypeScript..."
        rows={5}
      />
      {skills && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {skills.split(',').map((sk, i) => sk.trim() && (
            <span key={i} style={s.skillPreview}>{sk.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ data, updateArr, addItem, removeItem }) {
  return (
    <div>
      {data.map((proj, idx) => (
        <div key={proj.id || idx} style={s.entryCard}>
          <div style={s.entryHeader}>
            <span style={s.entryNum}>Project {idx + 1}</span>
            {data.length > 1 && <button onClick={() => removeItem('projects', idx)} style={s.removeBtn}>Remove</button>}
          </div>
          <div style={s.grid}>
            <Field label="Project name" half><Input value={proj.name} onChange={v => updateArr('projects', idx, 'name', v)} placeholder="SwarmIQ" /></Field>
            <Field label="Tech stack" half><Input value={proj.tech} onChange={v => updateArr('projects', idx, 'tech', v)} placeholder="Python, FastAPI, Azure AI" /></Field>
            <Field label="Description"><Textarea value={proj.description} onChange={v => updateArr('projects', idx, 'description', v)} placeholder="What the project does, your role, and its impact..." rows={3} /></Field>
            <Field label="Link (GitHub / Live)"><Input value={proj.link} onChange={v => updateArr('projects', idx, 'link', v)} placeholder="github.com/you/project" /></Field>
          </div>
        </div>
      ))}
      <button onClick={() => addItem('projects', EMPTY_PROJ)} style={s.addBtn}>+ Add project</button>
    </div>
  );
}

function CertsTab({ data, updateArr, addItem, removeItem }) {
  return (
    <div>
      {data.map((cert, idx) => (
        <div key={cert.id || idx} style={s.entryCard}>
          <div style={s.entryHeader}>
            <span style={s.entryNum}>Certification {idx + 1}</span>
            {data.length > 1 && <button onClick={() => removeItem('certifications', idx)} style={s.removeBtn}>Remove</button>}
          </div>
          <div style={s.grid}>
            <Field label="Certification name" half><Input value={cert.name} onChange={v => updateArr('certifications', idx, 'name', v)} placeholder="AWS Cloud Practitioner" /></Field>
            <Field label="Issuing organization" half><Input value={cert.issuer} onChange={v => updateArr('certifications', idx, 'issuer', v)} placeholder="Amazon Web Services" /></Field>
            <Field label="Date"><Input value={cert.date} onChange={v => updateArr('certifications', idx, 'date', v)} placeholder="June 2025" /></Field>
          </div>
        </div>
      ))}
      <button onClick={() => addItem('certifications', EMPTY_CERT)} style={s.addBtn}>+ Add certification</button>
    </div>
  );
}

// ── Style objects ──────────────────────────────────────────────────────

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--gray-600)', marginBottom: '5px' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--gray-900)', outline: 'none', background: 'white' },
  textarea: { width: '100%', padding: '9px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--gray-900)', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'var(--font-sans)', background: 'white' },
  entryCard: { background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.75rem' },
  entryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  entryNum: { fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  removeBtn: { background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer' },
  addBtn: { width: '100%', padding: '10px', border: '1.5px dashed var(--gray-300)', background: 'none', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--gray-500)', cursor: 'pointer', marginTop: '4px' },
  aiBtn: { marginTop: '8px', padding: '7px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: '500' },
  skillPreview: { background: 'var(--gray-100)', borderRadius: '4px', padding: '3px 10px', fontSize: '12px', color: 'var(--gray-700)' }
};

const styles = {
  root: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--gray-50)' },
  topbar: { background: 'white', borderBottom: '1px solid var(--gray-200)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '1rem' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
  backBtn: { background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  titleInput: { padding: '5px 10px', border: '1px solid transparent', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)', background: 'transparent', minWidth: 0, flex: 1, maxWidth: '280px' },
  saveStatus: { fontSize: '11px', color: 'var(--gray-400)', whiteSpace: 'nowrap' },
  topRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  scoreWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  scoreLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)', minWidth: '30px' },
  scoreBar: { width: '80px', height: '5px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s' },
  themeSelect: { padding: '6px 10px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--gray-700)', background: 'white' },
  topBtn: { padding: '6px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '13px', cursor: 'pointer' },
  pdfBtn: { padding: '6px 14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  editorPanel: { width: '400px', flexShrink: 0, background: 'white', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto', flexShrink: 0 },
  tab: { padding: '10px 14px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '12px', fontWeight: '500', color: 'var(--gray-500)', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: '-1px' },
  tabActive: { color: 'var(--primary)', borderBottomColor: 'var(--primary)' },
  editorBody: { flex: 1, overflowY: 'auto', padding: '1rem' },
  previewPanel: { flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--gray-100)' },
  aiPanel: { width: '320px', flexShrink: 0, background: 'white', borderLeft: '1px solid var(--gray-200)', overflowY: 'auto' }
};
