// backend/controller/content.controller.js
const ContentTask = require('../model/Content');

// @desc    Get all active content items (Planned or Processing)
// @route   GET /api/content/active
exports.getActiveContentTasks = async (req, res) => {
  try {
    const activeTasks = await ContentTask.find({ status: { $ne: 'Completed' } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: activeTasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a fresh manual content idea
// @route   POST /api/content/create
exports.createContentTask = async (req, res) => {
  try {
    const { title, associatedType, relatedProjectName, contentType } = req.body;
    const newTask = await ContentTask.create({
      title,
      associatedType,
      relatedProjectName: relatedProjectName || '',
      status: 'Planned',
      'aiMetadata.contentType': contentType || 'Long Form'
    });
    return res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger intentional visual simulation and hand off asynchronous packet to n8n
// @route   POST /api/content/complete/:id
exports.completeContentTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await ContentTask.findById(id);
    if (!task) return res.status(404).json({ success: false, message: "Content task not found" });

    // Lock local visual state for our skeleton loader effect
    task.status = 'Processing';
    await task.save();

    // Wait exactly 2000ms to fulfill the intentional UI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return res.status(200).json({ 
      success: true, 
      message: "Studio initialization complete. Rendering assets asynchronously.", 
      data: task
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all archived history content sets
// @route   GET /api/content/history
exports.getContentHistory = async (req, res) => {
  try {
    const history = await ContentTask.find({ status: 'Completed' }).sort({ completedAt: -1 });
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🎯 ACCELERATED TEXT PATH HANDLER (Step 4 Connection Destination)
// @route   POST /api/content/stage-text
exports.stageContentTextOnly = async (req, res) => {
  try {
    const { title, associatedType, relatedProjectName, optimizedTitle, description, contentType, tags , dallePrompt} = req.body;

    const stagedTask = await ContentTask.findOneAndUpdate(
      { title: title.trim() },
      {
        title: title.trim(),
        status: 'Staged',
        associatedType,
        relatedProjectName: relatedProjectName || '',
        status: 'Planned', 
        'aiMetadata.optimizedTitle': optimizedTitle || title,
        'aiMetadata.description': description || '',
        'aiMetadata.tags': tags || [],
        'aiMetadata.contentType': contentType || 'Long Form',
        'aiMetadata.stagedAt': new Date(),
        'aiMetadata.dallePrompt' : dallePrompt
      },
      { new: true, upsert: true }
    );

    console.log(`📥 Gemini Text Sync: Metadata staging complete for: "${stagedTask.title}"`);
    return res.status(200).json({ success: true, message: "Text metadata mapped successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🎯 BACKGROUND THUMBNAIL PATH HANDLER (Step 6 Connection Destination)
// @route   POST /api/content/callback-sync
exports.syncN8nAssetOutput = async (req, res) => {
  try {
    const { title, dallePrompt } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Missing title key tracking parameter." });
    }

    const finalizedTask = await ContentTask.findOneAndUpdate(
      { title: title.trim() },
      {
        $set: {
          status: 'Completed', // Smoothly flags completion state dropping it to your history drawer
          'aiMetadata.dallePrompt': dallePrompt || '',
          completedAt: new Date()
        }
      },
      { new: true }
    );

    console.log(`🚀 Prompt Toolkit Sync: Master copy block attached perfectly for: "${finalizedTask?.title}"`);
    return res.status(200).json({ success: true, message: "Prompt matrix callback sync complete.", data: finalizedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.archiveContentTask = async (req, res) => {
  try {
    const { id } = req.params;
    const finalized = await ContentTask.findByIdAndUpdate(
      id,
      { $set: { status: 'Completed', completedAt: new Date() } },
      { new: true }
    );
    return res.status(200).json({ success: true, message: "Task archived to history vault.", data: finalized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};