const BodyLog = require('../model/BodyLog');

const getISTDate = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// 🏋️ Log Exercise Sets (Stays perfectly functional)
exports.logWorkout = async (req, res) => {
    try {
        const todayDate = getISTDate();
        const { exerciseName, sets } = req.body;

        if (!exerciseName || !sets || sets.length === 0) {
            return res.status(400).json({ success: false, message: "Missing workout parameters." });
        }

        let log = await BodyLog.findOne({ date: todayDate });
        if (!log) {
            log = new BodyLog({ date: todayDate, exercises: [], totalCaloriesIntake: 0, totalProteinIntake: 0 });
        }

        const existingExercise = log.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase().trim());
        if (existingExercise) {
            existingExercise.sets.push(...sets);
        } else {
            log.exercises.push({ name: exerciseName.trim(), sets });
        }

        await log.save();
        return res.status(200).json({ success: true, message: "Workout data logged successfully!", data: log });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 🟩 Direct Calorie Log - Sets the definitive absolute count from your mobile app
exports.updateDailyMacros = async (req, res) => {
    try {
        const todayDate = getISTDate();
        const { calories, protein } = req.body;

        let log = await BodyLog.findOne({ date: todayDate });
        if (!log) {
            log = new BodyLog({ date: todayDate, exercises: [], totalCaloriesIntake: 0, totalProteinIntake: 0 });
        }

        // Directly sync totals from your Healthify tracking fields
        if (calories !== undefined) log.totalCaloriesIntake = Number(calories);
        if (protein !== undefined) log.totalProteinIntake = Number(protein);

        await log.save();
        return res.status(200).json({ success: true, message: "Healthify metrics synced successfully!", data: log });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Fetch current states
exports.getTodayBodyLog = async (req, res) => {
    try {
        const todayDate = getISTDate();
        const log = await BodyLog.findOne({ date: todayDate });
        
        if (!log) {
            return res.status(200).json({
                success: true,
                data: { date: todayDate, exercises: [], totalCaloriesIntake: 0, totalProteinIntake: 0 }
            });
        }
        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};