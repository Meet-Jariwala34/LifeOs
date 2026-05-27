// backend/models/DsaProblem.js
const mongoose = require('mongoose');

const DsaProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  problemNumber: { type: Number },
  topic: { type: String },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  problemUrl: { type: String, required: true },
  
  // Spaced Repetition Engine Fields
  revisionStage: { 
    type: Number, 
    default: 0 // Stages: 0 = Untouched, 1 = 2 days, 2 = 7 days, 3 = 15 days, 4 = 45 days, 5 = Fully Mastered
  },
  nextVisibleRevisionDate: {
    type: Date,
    default: Date.now // Default to now so untouched items show up instantly
  },
  lastSolvedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DsaProblem', DsaProblemSchema);