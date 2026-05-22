// backend/models/Project.js
const mongoose = require('mongoose');

// 1. Define the Milestone Schema (The Sub-document for individual topic steps)
const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a milestone or topic title'],
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  techUsed: [
    {
      type: String,
      trim: true
    }
  ],
  purpose: {
    type: String,
    trim: true,
    default: ''
  }
});

// 2. Define the Main Project Schema
const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    unique: true, // Prevents duplicate project files
    trim: true
  },
  idea: {
    type: String,
    required: [true, 'Please add the core project concept/idea'],
    trim: true
  },
  thingsToLearn: [
    {
      type: String,
      trim: true // Tracks global tags like "Docker", "Redis", "Nginx"
    }
  ],
  // An array of embedded milestone documents using the schema defined above
  milestones: [MilestoneSchema],
  
  // Virtual or calculated completion percentage
  completionPercentage: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 3. Pre-save Middleware to automatically calculate completion percentage
ProjectSchema.pre('save', function (next) {
  if (!this.milestones || this.milestones.length === 0) {
    this.completionPercentage = 0;
  } else {
    const completedCount = this.milestones.filter(m => m.isCompleted).length;
    this.completionPercentage = Math.round((completedCount / this.milestones.length) * 100);
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);