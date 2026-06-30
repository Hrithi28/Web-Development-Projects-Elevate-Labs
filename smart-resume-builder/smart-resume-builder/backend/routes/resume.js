const express = require('express');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/resumes — list all resumes for user
router.get('/', async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('title theme updatedAt personal.name')
      .sort({ updatedAt: -1 });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// POST /api/resumes — create new resume
router.post('/', async (req, res) => {
  try {
    const count = await Resume.countDocuments({ user: req.user._id });
    if (count >= 10) {
      return res.status(400).json({ error: 'Maximum 10 resumes allowed' });
    }

    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || 'My Resume',
      ...req.body
    });
    res.status(201).json({ message: 'Resume created', resume });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// GET /api/resumes/:id — get single resume
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// PUT /api/resumes/:id — update resume
router.put('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ message: 'Resume saved', resume });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// DELETE /api/resumes/:id — delete resume
router.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

module.exports = router;
