const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  duration: { type: String, default: '' },
  description: { type: String, default: '' }
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  school: { type: String, default: '' },
  location: { type: String, default: '' },
  duration: { type: String, default: '' },
  gpa: { type: String, default: '' }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  tech: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' }
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' }
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'My Resume',
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  personal: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  summary: { type: String, default: '' },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: { type: String, default: '' },
  projects: [projectSchema],
  certifications: [certificationSchema],
  theme: {
    type: String,
    enum: ['classic', 'modern', 'minimal'],
    default: 'classic'
  },
  lastAISuggestions: {
    suggestions: { type: String, default: '' },
    score: { type: Number, default: 0 },
    generatedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
