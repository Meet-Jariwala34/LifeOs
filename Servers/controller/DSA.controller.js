// backend/controllers/dsaController.js
const DsaProblem = require('../model/DSA');

// Static reference data array mapping to your Blind 75 goals
const BLIND_75_SEED = [
  { id: 1 , title: "Two Sum", topic: "Arrays", difficulty: "Easy", problemUrl: "https://leetcode.com/problems/two-sum/" },
  { id: 24, title: "Valid Anagram", topic: "Strings", difficulty: "Easy", problemUrl: "https://leetcode.com/problems/valid-anagram/" },
  { id: 134, title: "Group Anagrams", topic: "HashMaps", difficulty: "Medium", problemUrl: "https://leetcode.com/problems/group-anagrams/" },
  { id:156 , title: "Top K Frequent Elements", topic: "Arrays", difficulty: "Medium", problemUrl: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { id: 275, title: "Product of Array Except Self", topic: "Arrays", difficulty: "Medium", problemUrl: "https://leetcode.com/problems/product-of-array-except-self/" }
];

// Time schedule intervals array mapping (Index matches the revisionStage rank value)
const INTERVAL_DAYS_MAP = [0, 2, 7, 15, 45];

// @desc    Get current daily deck (Due items from DB + Untouched seed items)
// @route   GET /api/dsa/daily-deck
exports.getDailyDeck = async (req, res) => {
  try {
    const rightNow = new Date();

    // A. Query MongoDB for any problem whose review window has officially matured ($lte = Less Than or Equal to Now)
    const dueRevisionProblems = await DsaProblem.find({
      revisionStage: { $gt: 0, $lt: 5 }, // Items actively inside the training loop but not yet fully complete
      nextVisibleRevisionDate: { $lte: rightNow }
    }).limit(5);

    let dailyDeck = [...dueRevisionProblems];

    // B. If your review queue has open space left, fill it with untouched items from your static seed code bank
    if (dailyDeck.length < 5) {
      const activeUserRecords = await DsaProblem.find();
      const userInteractedTitles = new Set(activeUserRecords.map(p => p.title));

      for (const seedItem of BLIND_75_SEED) {
        if (dailyDeck.length >= 5) break;
        if (userInteractedTitles.has(seedItem.title)) continue; // Skip if it's already recorded in DB

        dailyDeck.push({
          id : seedItem.id,
          title: seedItem.title,
          topic: seedItem.topic,
          difficulty: seedItem.difficulty,
          problemUrl: seedItem.problemUrl,
          revisionStage: 0
        });
      }
    }

    // C. NEW MATH: Count how many total problems you successfully solved today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Reset clock to midnight last night

    const solvedTodayCount = await DsaProblem.countDocuments({
      lastSolvedAt: { $gte: startOfToday },
      revisionStage: { $gt: 0 } // Filter out any completely untouched questions
    });

    return res.status(200).json({ 
      success: true, 
      count: dailyDeck.length, 
      solvedTodayCount: solvedTodayCount, // Pass this new tracker counter to the frontend!
      data: dailyDeck 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate and update the Spaced Repetition timeline snapshot values
// @route   POST /api/dsa/update-state
exports.updateProblemStatus = async (req, res) => {
  try {
    const { title, topic, difficulty, problemUrl, action } = req.body; // action expected: 'PASSED' or 'FAILED'
    
    // Find existing tracking entry document or fall back to an empty defaults object
    const existingRecord = await DsaProblem.findOne({ title }) || { revisionStage: 0 };

    let nextStage = existingRecord.revisionStage;
    let daysToAdd = 0;

    if (action === 'PASSED') {
      // Advance to the next spaced interval stage level up to stage 5 (Complete Mastery)
      nextStage = Math.min(nextStage + 1, 5);
      daysToAdd = INTERVAL_DAYS_MAP[nextStage] || 0;
    } else if (action === 'FAILED') {
      // Break sequence: Drop interval stage back down to Day 2 review loop path parameters
      nextStage = 1;
      daysToAdd = INTERVAL_DAYS_MAP[1]; 
    }

    // Calculate future timestamp target date
    const calculatedReleaseDate = new Date();
    calculatedReleaseDate.setDate(calculatedReleaseDate.getDate() + daysToAdd);

    const updatedProblem = await DsaProblem.findOneAndUpdate(
      { title },
      {
        title,
        topic,
        difficulty,
        problemUrl,
        revisionStage: nextStage,
        nextVisibleRevisionDate: nextStage === 5 ? null : calculatedReleaseDate, // Setting to null preserves the database record while removing it from future deck queries entirely
        lastSolvedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: action === 'PASSED' ? `Advanced to Stage ${nextStage}. Review in ${daysToAdd} days.` : 'Reset to Stage 1. Review in 2 days.',
      data: updatedProblem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProblemHistory = async (req, res) => {
  try {
    // Fetch all records, sorting by the last time they were manipulated/solved
    const history = await DsaProblem.find({ revisionStage: { $gt: 0 } })
                                    .sort({ lastSolvedAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};