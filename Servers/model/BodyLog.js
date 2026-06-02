const mongoose = require('mongoose');

const ExerciseItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: [{
        reps: { type: Number, required: true },
        weight: { type: Number, required: true }
    }]
}, { timestamps: true });

const BodyLogSchema = new mongoose.Schema({
    date: { 
        type: String, 
        required: true, 
        unique: true  // Format: YYYY-MM-DD
    },
    exercises: [ExerciseItemSchema],
    // 🟩 Direct total inputs from Healthify app data points
    totalCaloriesIntake: { type: Number, default: 0 },
    totalProteinIntake: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('BodyLog', BodyLogSchema);