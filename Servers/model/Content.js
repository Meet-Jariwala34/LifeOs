// backend/models/ContentTask.js
const mongoose = require('mongoose');

const ContentTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  associatedType: { type: String, required: true, enum: ['DSA', 'Project', 'General'] },
  relatedProjectName: { type: String, default: '', trim: true },
  status: { type: String, required: true, enum: ['Planned', 'Processing', 'Completed'], default: 'Planned' },
  
  status: { type: String, required: true, enum: ['Planned', 'Processing', 'Staged', 'Completed'], default: 'Planned' },
  // 🎯 PRE-GENERATED PRODUCTION DATA STAGED BY n8n
  aiMetadata: {
    optimizedTitle: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    contentType: { type: String, enum: ['Shorts', 'Long Form'], default: 'Long Form' },
    thumbnailUrl: { type: String, default: '' }, 
    dallePrompt: { type: String, default: '' }, // 🚀 NEW: Holds the master prompt copy block string
    stagedAt: { type: Date }
  },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ContentTask', ContentTaskSchema);