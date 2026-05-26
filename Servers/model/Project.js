// backend/models/Project.js
const mongoose = require('mongoose');

// Tier 3: Individual Dev Steps Checklist Schema
const StepSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

// Tier 2: Core Feature Module Schema
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., 'Real-time Chat System'
  techStack: [{ type: String }],           // e.g., ['Socket.io', 'Redis']
  steps: [StepSchema],                     // Arrays of sub-steps checkboxes
  resources: [{
    label: String,
    url: String
  }]
});

// Tier 1: Overarching Project Shell Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g., 'Instagram Clone'
  description: { type: String, required: true },
  modules: [ModuleSchema], // Array of child feature components
  repositoryUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);