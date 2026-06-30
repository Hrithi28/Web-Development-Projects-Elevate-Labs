const express = require('express');
const OpenAI = require('openai');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/ai/suggestions — get AI suggestions for a resume
router.post('/suggestions', async (req, res) => {
  try {
    const { resumeId } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const openai = getOpenAI();

    const resumeText = `
Name: ${resume.personal.name || 'Not provided'}
Email: ${resume.personal.email || 'Not provided'}
Summary: ${resume.summary || 'Not provided'}
Experience: ${resume.experience.map(ex =>
  `${ex.title} at ${ex.company} (${ex.duration}): ${ex.description}`
).join('\n') || 'None'}
Education: ${resume.education.map(ed =>
  `${ed.degree} from ${ed.school} (${ed.duration}) ${ed.gpa ? `GPA: ${ed.gpa}` : ''}`
).join('\n') || 'None'}
Skills: ${resume.skills || 'Not provided'}
Projects: ${resume.projects.map(p =>
  `${p.name} (${p.tech}): ${p.description}`
).join('\n') || 'None'}
Certifications: ${resume.certifications.map(c =>
  `${c.name} by ${c.issuer} (${c.date})`
).join('\n') || 'None'}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume coach and career advisor with 10+ years of experience helping candidates land jobs at top companies. Analyze resumes and provide specific, actionable, constructive feedback. Be direct and practical.`
        },
        {
          role: 'user',
          content: `Please review this resume and provide exactly 5 specific, actionable improvement suggestions. For each suggestion, explain WHY it matters and HOW to implement it. Format your response as a numbered list.

${resumeText}

Focus on: impact metrics, action verbs, keyword optimization, ATS compatibility, and overall presentation.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const suggestions = completion.choices[0].message.content;

    // Calculate a simple score
    let score = 0;
    if (resume.personal.name) score += 10;
    if (resume.personal.email) score += 5;
    if (resume.personal.phone) score += 5;
    if (resume.personal.linkedin) score += 5;
    if (resume.summary && resume.summary.length > 50) score += 20;
    if (resume.experience.some(ex => ex.title && ex.description)) score += 25;
    if (resume.education.some(ed => ed.degree)) score += 10;
    if (resume.skills) score += 10;
    if (resume.projects.some(p => p.name)) score += 10;

    // Save suggestions to resume
    await Resume.findByIdAndUpdate(resumeId, {
      'lastAISuggestions.suggestions': suggestions,
      'lastAISuggestions.score': score,
      'lastAISuggestions.generatedAt': new Date()
    });

    res.json({ suggestions, score });
  } catch (err) {
    if (err.message === 'OpenAI API key not configured') {
      return res.status(503).json({ error: 'AI service not configured. Add OPENAI_API_KEY to .env' });
    }
    console.error('AI suggestions error:', err);
    res.status(500).json({ error: 'Failed to get AI suggestions' });
  }
});

// POST /api/ai/improve-summary — improve the summary
router.post('/improve-summary', async (req, res) => {
  try {
    const { resumeId } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Rewrite professional summaries to be compelling, concise, and impactful. Use strong action verbs and quantify achievements where possible.'
        },
        {
          role: 'user',
          content: `Rewrite this professional summary to be more impactful. Make it 2-3 sentences, ATS-friendly, and highlight the candidate's value proposition.

Current summary: "${resume.summary || 'No summary provided'}"
Name: ${resume.personal.name}
Current role/experience: ${resume.experience[0]?.title || 'Not specified'} at ${resume.experience[0]?.company || 'Not specified'}
Key skills: ${resume.skills || 'Not specified'}

Return ONLY the improved summary text, nothing else.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const improvedSummary = completion.choices[0].message.content.trim();
    res.json({ improvedSummary });
  } catch (err) {
    if (err.message === 'OpenAI API key not configured') {
      return res.status(503).json({ error: 'AI service not configured' });
    }
    res.status(500).json({ error: 'Failed to improve summary' });
  }
});

// POST /api/ai/improve-description — improve a job description bullet
router.post('/improve-description', async (req, res) => {
  try {
    const { description, jobTitle, company } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Improve job description bullets to be more impactful using strong action verbs and quantified achievements.'
        },
        {
          role: 'user',
          content: `Improve these job description bullet points for a ${jobTitle || 'professional'} role at ${company || 'a company'}. Use strong action verbs, add impact metrics where logical, and make each bullet ATS-friendly.

Current description:
${description}

Return ONLY the improved bullet points, keeping the same format.`
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    const improvedDescription = completion.choices[0].message.content.trim();
    res.json({ improvedDescription });
  } catch (err) {
    if (err.message === 'OpenAI API key not configured') {
      return res.status(503).json({ error: 'AI service not configured' });
    }
    res.status(500).json({ error: 'Failed to improve description' });
  }
});

module.exports = router;
