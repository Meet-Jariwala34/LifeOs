// backend/controllers/dsaController.js
const dsaList = require('../constants/blind75.json');
const DsaProblem = require('../model/DSA');

// TIME INTERVAL MATRIX (Index matches the revisionStage rank value)
const INTERVAL_DAYS_MAP = [0, 2, 7, 15, 45];

// @desc    Get current daily deck sequentially following the exact NeetCode curriculum
// @route   GET /api/dsa/daily-deck
exports.getDailyDeck = async (req, res) => {
  try {
    const { forceRefresh } = req.query;
    const now = new Date();
    
    // ⏰ Calculate Today's 6:00 AM local rollover boundary anchor target
    const resetBoundary = new Date();
    resetBoundary.setHours(6, 0, 0, 0);
    if (now < resetBoundary) {
      resetBoundary.setDate(resetBoundary.getDate() - 1);
    }

    // 1. Fetch ALL tracking records from MongoDB Atlas
    const trackedProblems = await DsaProblem.find();
    
    // Find questions that belong to today's active locked deck window interval (after 6 AM local time)
    let dailyDeckItems = trackedProblems.filter(p => p.lastSolvedAt && new Date(p.lastSolvedAt) >= resetBoundary);

    // 2. TRIGGER SEQUENTIAL SELECTION: If deck is empty or user hit "Request Next Set"
    if (dailyDeckItems.length === 0 || forceRefresh === 'true') {
      const masteredTitles = new Set(trackedProblems.filter(p => p.revisionStage === 5).map(p => p.title));
      const lockedUntilFutureTitles = new Set();
      const activeDeckTitlesToExclude = new Set();

      // If forcing a fresh set, ensure we skip the questions currently on screen
      if (forceRefresh === 'true' && dailyDeckItems.length > 0) {
        dailyDeckItems.forEach(item => activeDeckTitlesToExclude.add(item.title));
      }

      trackedProblems.forEach(p => {
        if (p.nextVisibleRevisionDate && new Date(p.nextVisibleRevisionDate) > now && p.revisionStage < 5) {
          lockedUntilFutureTitles.add(p.title);
        }
      });

      // Group A: High-Priority Due Reviews
      const dueReviewPool = trackedProblems.filter(p => 
        p.revisionStage > 0 && 
        p.revisionStage < 5 &&
        (!p.nextVisibleRevisionDate || new Date(p.nextVisibleRevisionDate) <= now) &&
        !activeDeckTitlesToExclude.has(p.title)
      );

      dueReviewPool.sort((a, b) => new Date(a.nextVisibleRevisionDate) - new Date(b.nextVisibleRevisionDate));
      let selectedBatch = dueReviewPool.slice(0, 5);

      // Group B: Fresh Sequential Fill
      if (selectedBatch.length < 5) {
        const remainingSlotsNeeded = 5 - selectedBatch.length;
        
        const freshAvailableSequence = dsaList.filter(prob => 
          !masteredTitles.has(prob.title) && 
          !lockedUntilFutureTitles.has(prob.title) &&
          !activeDeckTitlesToExclude.has(prob.title) &&
          !selectedBatch.some(selected => selected.title === prob.title)
        );

        const freshFillBatch = freshAvailableSequence.slice(0, remainingSlotsNeeded);
        selectedBatch = [...selectedBatch, ...freshFillBatch];
      }

      // Save or update these final 5 items into MongoDB to lock them for today
      dailyDeckItems = await Promise.all(selectedBatch.map(async (prob) => {
        // We look up if this item already has a record to preserve its revision stage status
        const existing = trackedProblems.find(t => t.title === prob.title);
        
        const doc = await DsaProblem.findOneAndUpdate(
          { title: prob.title },
          {
            title: prob.title,
            problemNumber: prob.problemNumber,
            difficulty: prob.difficulty,
            topic: prob.topicTag || prob.topic, 
            problemUrl: prob.problemUrl,
            patternType: prob.patternType,
            // If it's a completely fresh seed item, update lastSolvedAt to lock it into today's frame.
            // If it's an existing review item, leave its lastSolvedAt alone until they click a button!
            lastSolvedAt: existing && existing.revisionStage > 0 ? existing.lastSolvedAt : new Date(),
            $setOnInsert: { revisionStage: 0 } 
          },
          { returnDocument: 'after', upsert: true }
        );
        return doc.toObject(); 
      }));
    }

    // 3. Map values back to match your React component layout parameters smoothly
    const activeDailyDeck = dailyDeckItems.map(p => {
      const cleanDoc = p._doc || p; 
      
      // Look up the live model status to see if it was modified inside today's reset boundary
      const liveRecord = trackedProblems.find(t => t.title === cleanDoc.title) || cleanDoc;
      const hasBeenSolvedToday = liveRecord.lastSolvedAt && new Date(liveRecord.lastSolvedAt) >= resetBoundary;

      return {
        _id: cleanDoc._id,
        problemNumber: cleanDoc.problemNumber,
        title: cleanDoc.title,
        problemUrl: cleanDoc.problemUrl,
        difficulty: cleanDoc.difficulty,
        topicTag: cleanDoc.topic, 
        patternType: cleanDoc.patternType,
        revisionStage: liveRecord.revisionStage || 0,
        // 🎯 STATUS LOGIC: It only displays as 'Revision' if it has been touched since 6:00 AM today!
        status: (liveRecord.revisionStage > 0 && hasBeenSolvedToday) ? 'Revision' : 'Untouched'
      };
    });

    // 4. 💎 FIXED PROGRESS CALCULATION
    // Count how many items in your current active 5-deck array have been solved today
    const solvedTodayCount = activeDailyDeck.filter(p => p.status === 'Revision').length;

    return res.status(200).json({
      success: true,
      data: activeDailyDeck,
      solvedTodayCount: solvedTodayCount // Smoothly updates your "X / 5 Solved" gauge!
    });

  } catch (error) {
    console.error("❌ High-speed DSA selector failed:", error.message);
    return res.status(500).json({ success: false, message: "Internal server data node lookup fault." });
  }
};

// @desc    Calculate and update the Spaced Repetition timeline snapshot values
// @route   POST /api/dsa/updateStatus
exports.updateProblemStatus = async (req, res) => {
  try {
    const { title, topic, difficulty, problemUrl, action } = req.body; 
    
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
        nextVisibleRevisionDate: nextStage === 5 ? null : calculatedReleaseDate,
        lastSolvedAt: new Date() // 🎯 FIXED: Stores clean ISO Date object for correct daily sync matching
      },
      { returnDocument: 'after', upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: action === 'PASSED' ? `Advanced to Stage ${nextStage}. Review in ${daysToAdd} days.` : 'Reset to Stage 1. Review in 2 days.',
      data: updatedProblem
    });
  } catch (error) {
    console.error("❌ Status update write failed:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProblemHistory = async (req, res) => {
  try {
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