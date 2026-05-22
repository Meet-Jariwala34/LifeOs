// backend/models/DsaProblem.js
const mongoose = require('mongoose');

const DsaProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a problem title'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Please add the LeetCode / external platform link'],
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Revision'],
    default: 'New'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  // This stores the text area logs you write inside your pop-up modal
  userApproach: {
    type: String,
    default: '',
    trim: true
  },
  // Tracks your custom self-assessment rating from the modal slider
  userAssessment: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', ''],
    default: ''
  },
  // Automatically tracks when you logged or updated this challenge
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DsaProblem', DsaProblemSchema);