import React from 'react';

const themes = {
  classic: { accent: '#1a1a1a', secondary: '#444', muted: '#666', border: '#1a1a1a', font: 'Georgia, serif' },
  modern: { accent: '#2563eb', secondary: '#374151', muted: '#6b7280', border: '#2563eb', font: 'Arial, sans-serif' },
  minimal: { accent: '#111827', secondary: '#374151', muted: '#9ca3af', border: '#d1d5db', font: 'Helvetica, Arial, sans-serif' }
};

export default function ResumePreview({ data }) {
  const t = themes[data?.theme] || themes.classic;
  const p = data?.personal || {};
  const skills = data?.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  const sectionTitle = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: t.accent, marginBottom: '8px', marginTop: '2px' }}>
      {text}
    </div>
  );

  const divider = () => (
    <hr style={{ border: 'none', borderTop: `1.5px solid ${t.border}`, margin: '10px 0 8px' }} />
  );

  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0', overflow: 'hidden', minHeight: '700px' }}>
      <div style={{ padding: '32px 36px', fontFamily: t.font }}>
        {/* Header */}
        <div style={{ fontSize: '22px', fontWeight: '700', color: t.accent, letterSpacing: '-0.3px' }}>
          {p.name || <span style={{ color: '#d1d5db' }}>Your Name</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '5px', fontSize: '11px', color: t.muted }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.portfolio && <span>{p.portfolio}</span>}
        </div>

        {/* Summary */}
        {data?.summary && (
          <>
            {divider()}
            {sectionTitle('Summary')}
            <div style={{ fontSize: '11px', color: t.secondary, lineHeight: '1.7' }}>{data.summary}</div>
          </>
        )}

        {/* Experience */}
        {data?.experience?.some(ex => ex.title || ex.company) && (
          <>
            {divider()}
            {sectionTitle('Experience')}
            {data.experience.filter(ex => ex.title || ex.company).map((ex, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: t.accent }}>{ex.title}</span>
                  <span style={{ fontSize: '10px', color: t.muted }}>{ex.duration}</span>
                </div>
                <div style={{ fontSize: '11px', color: t.secondary, margin: '2px 0 3px' }}>
                  {[ex.company, ex.location].filter(Boolean).join(' · ')}
                </div>
                {ex.description && (
                  <div style={{ fontSize: '11px', color: '#333', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {ex.description}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {data?.education?.some(ed => ed.degree || ed.school) && (
          <>
            {divider()}
            {sectionTitle('Education')}
            {data.education.filter(ed => ed.degree || ed.school).map((ed, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: t.accent }}>{ed.degree}</span>
                  <span style={{ fontSize: '10px', color: t.muted }}>{ed.duration}</span>
                </div>
                <div style={{ fontSize: '11px', color: t.secondary }}>
                  {ed.school}{ed.gpa ? ` · GPA: ${ed.gpa}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Projects */}
        {data?.projects?.some(p => p.name) && (
          <>
            {divider()}
            {sectionTitle('Projects')}
            {data.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: t.accent }}>
                    {proj.name}
                    {proj.tech && <span style={{ fontWeight: '400', fontSize: '10px', color: t.muted }}> | {proj.tech}</span>}
                  </span>
                  {proj.link && <span style={{ fontSize: '10px', color: t.muted }}>{proj.link}</span>}
                </div>
                {proj.description && <div style={{ fontSize: '11px', color: '#333', marginTop: '2px', lineHeight: '1.5' }}>{proj.description}</div>}
              </div>
            ))}
          </>
        )}

        {/* Certifications */}
        {data?.certifications?.some(c => c.name) && (
          <>
            {divider()}
            {sectionTitle('Certifications')}
            {data.certifications.filter(c => c.name).map((cert, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: t.accent }}>{cert.name}</span>
                  <span style={{ fontSize: '10px', color: t.muted }}>{cert.date}</span>
                </div>
                {cert.issuer && <div style={{ fontSize: '11px', color: t.secondary }}>{cert.issuer}</div>}
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {data?.skills && (
          <>
            {divider()}
            {sectionTitle('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.map((sk, i) => (
                <span key={i} style={{ background: '#f3f4f6', borderRadius: '3px', padding: '2px 8px', fontSize: '10px', color: '#374151' }}>
                  {sk}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
