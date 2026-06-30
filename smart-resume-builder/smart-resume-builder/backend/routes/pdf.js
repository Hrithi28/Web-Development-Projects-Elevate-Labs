const express = require('express');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Generate HTML for the resume
function generateResumeHTML(resume, theme = 'classic') {
  const themes = {
    classic: {
      accent: '#1a1a1a',
      secondary: '#444',
      muted: '#666',
      border: '#1a1a1a',
      font: 'Georgia, serif',
      headerFont: 'Georgia, serif'
    },
    modern: {
      accent: '#2563eb',
      secondary: '#374151',
      muted: '#6b7280',
      border: '#2563eb',
      font: 'Arial, sans-serif',
      headerFont: 'Arial, sans-serif'
    },
    minimal: {
      accent: '#111827',
      secondary: '#374151',
      muted: '#9ca3af',
      border: '#d1d5db',
      font: 'Helvetica, Arial, sans-serif',
      headerFont: 'Helvetica, Arial, sans-serif'
    }
  };

  const t = themes[theme] || themes.classic;
  const p = resume.personal || {};

  const skillsList = resume.skills
    ? resume.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.name || 'Resume'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${t.font};
    color: #1a1a1a;
    background: white;
    padding: 48px 56px;
    max-width: 800px;
    margin: 0 auto;
    font-size: 13px;
    line-height: 1.5;
  }
  .name {
    font-family: ${t.headerFont};
    font-size: 26px;
    font-weight: 700;
    color: ${t.accent};
    letter-spacing: -0.5px;
  }
  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 6px;
    font-size: 12px;
    color: ${t.muted};
  }
  .contact span::before {
    content: '';
  }
  .divider {
    border: none;
    border-top: 2px solid ${t.border};
    margin: 14px 0 10px;
  }
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${t.accent};
    margin-bottom: 10px;
  }
  .entry { margin-bottom: 12px; }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-weight: 700;
    font-size: 13px;
    color: ${t.accent};
  }
  .entry-date {
    font-size: 11px;
    color: ${t.muted};
    white-space: nowrap;
  }
  .entry-sub {
    font-size: 12px;
    color: ${t.secondary};
    margin: 2px 0 4px;
  }
  .entry-desc {
    font-size: 12px;
    color: #333;
    white-space: pre-line;
    line-height: 1.6;
  }
  .summary-text {
    font-size: 13px;
    color: ${t.secondary};
    line-height: 1.7;
  }
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .skill-tag {
    background: #f3f4f6;
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 11px;
    color: #374151;
  }
  @media print {
    body { padding: 24px 32px; }
    .divider { margin: 10px 0 8px; }
  }
</style>
</head>
<body>
  <div class="name">${p.name || ''}</div>
  <div class="contact">
    ${p.email ? `<span>${p.email}</span>` : ''}
    ${p.phone ? `<span>${p.phone}</span>` : ''}
    ${p.location ? `<span>${p.location}</span>` : ''}
    ${p.linkedin ? `<span>${p.linkedin}</span>` : ''}
    ${p.portfolio ? `<span>${p.portfolio}</span>` : ''}
  </div>

  ${resume.summary ? `
  <hr class="divider">
  <div class="section-title">Summary</div>
  <div class="summary-text">${resume.summary}</div>
  ` : ''}

  ${resume.experience && resume.experience.some(ex => ex.title || ex.company) ? `
  <hr class="divider">
  <div class="section-title">Experience</div>
  ${resume.experience.filter(ex => ex.title || ex.company).map(ex => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${ex.title || ''}</span>
        <span class="entry-date">${ex.duration || ''}</span>
      </div>
      <div class="entry-sub">${[ex.company, ex.location].filter(Boolean).join(' · ')}</div>
      ${ex.description ? `<div class="entry-desc">${ex.description}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  ${resume.education && resume.education.some(ed => ed.degree || ed.school) ? `
  <hr class="divider">
  <div class="section-title">Education</div>
  ${resume.education.filter(ed => ed.degree || ed.school).map(ed => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${ed.degree || ''}</span>
        <span class="entry-date">${ed.duration || ''}</span>
      </div>
      <div class="entry-sub">${ed.school || ''}${ed.gpa ? ` · GPA: ${ed.gpa}` : ''}</div>
    </div>
  `).join('')}
  ` : ''}

  ${resume.projects && resume.projects.some(p => p.name) ? `
  <hr class="divider">
  <div class="section-title">Projects</div>
  ${resume.projects.filter(p => p.name).map(proj => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${proj.name}${proj.tech ? ` <span style="font-weight:400;font-size:11px;color:#666">| ${proj.tech}</span>` : ''}</span>
        ${proj.link ? `<span class="entry-date">${proj.link}</span>` : ''}
      </div>
      ${proj.description ? `<div class="entry-desc">${proj.description}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  ${resume.certifications && resume.certifications.some(c => c.name) ? `
  <hr class="divider">
  <div class="section-title">Certifications</div>
  ${resume.certifications.filter(c => c.name).map(cert => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${cert.name}</span>
        <span class="entry-date">${cert.date || ''}</span>
      </div>
      ${cert.issuer ? `<div class="entry-sub">${cert.issuer}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  ${resume.skills ? `
  <hr class="divider">
  <div class="section-title">Skills</div>
  <div class="skills-list">
    ${skillsList.map(s => `<span class="skill-tag">${s}</span>`).join('')}
  </div>
  ` : ''}
</body>
</html>`;
}

// GET /api/pdf/:resumeId — return HTML for PDF export
router.get('/:resumeId', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const html = generateResumeHTML(resume, resume.theme || 'classic');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
