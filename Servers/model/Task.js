// backend/models/Task.js
const mongoose = require('mongoose');

// Individual Step Checklist Schema for the AI Roadmap
const TaskStepSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

// Standalone AI Task Blueprint Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, 
  description: { type: String, default: 'AI Generated Task Workspace Blueprint' },
  steps: [TaskStepSchema], // Clean, flat array of checklist steps
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);