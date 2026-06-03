// backend/controllers/projectController.js
const Project = require('../model/Project');
const DSA = require('../model/DSA');
const Task = require('../model/Task');
const contetModel = require('../model/Content');
const BodyLog = require('../model/BodyLog');
const axios = require('axios');
const {autoTriggerContentTask}  = require('../utils/contentTrigger');

// Fetch all project cards with aggregated completeness percentages
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ _id: -1 });
    
    const formattedProjects = projects.map(proj => {
      let totalSteps = 0;
      let completedSteps = 0;

      proj.modules.forEach(mod => {
        mod.steps.forEach(step => {
          totalSteps++;
          if (step.isCompleted) completedSteps++;
        });
      });

      return {
        ...proj._doc,
        progress: totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100)
      };
    });

    return res.status(200).json({ success: true, data: formattedProjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Fire the initialization packet to n8n for Gemini AI hydration
// Fire the initialization packet to n8n for Gemini AI hydration
exports.addProjectWithAI = async (req, res) => {
  try {
    const { title, description, baseTech } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Required parameters missing." });
    }

    // 1. Spawn the trackable object shell inside Atlas first
    const temporaryProjectShell = await Project.create({
      title,
      description,
      techStack: baseTech ? baseTech.split(',').map(t => t.trim()) : [],
      modules: []
    });

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL_PROJECT || 'http://localhost:5678/webhook-test/LifeOs_architecture';

    try {
      // 2. Send the project payload data to n8n and wait for the Gemini output
      const n8nResponse = await axios.post(N8N_WEBHOOK_URL, {
        projectId: temporaryProjectShell._id,
        title,
        description,
        baseTech
      });

      // 3. Extract the pristine techStack and modules arrays returned by n8n
      const { techStack, modules } = n8nResponse.data;

      // 4. Save the nested data arrays permanently into Atlas using Mongoose!
      const fullyHydratedProject = await Project.findByIdAndUpdate(
        temporaryProjectShell._id,
        { 
          $set: { 
            techStack: techStack || [], 
            modules: modules || [] 
          } 
        },
        { new: true } // Returns the newly updated document with all sub-modules populated!
      );

      // 5. Send the complete, hydrated project document directly back to your React app
      return res.status(201).json({
        success: true,
        message: 'Database clusters hydrated successfully.',
        data: {
          ...fullyHydratedProject._doc,
          progress: 0
        }
      });

    } catch (n8nError) {
      console.error("n8n execution fumbled:", n8nError.message);
      return res.status(201).json({
        success: true,
        message: 'Project initialized, but background automation is unreachable.',
        data: { ...temporaryProjectShell._doc, progress: 0 }
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Check/Uncheck a specific feature checklist step
exports.toggleStepCompletion = async (req, res) => {
  try {
    const { projectId, moduleId, stepId } = req.params;
    const { isCompleted } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project node unlocated' });

    const targetModule = project.modules.id(moduleId);
    if (!targetModule) return res.status(404).json({ success: false, message: 'Module node unlocated' });

    const targetStep = targetModule.steps.id(stepId);
    if (!targetStep) return res.status(404).json({ success: false, message: 'Checklist step unlocated' });

    // Apply the checked value change state
    targetStep.isCompleted = isCompleted;
    project.updatedAt = Date.now();

    // 🎯 CRITICAL REFACTOR: Save updates to the database!
    await project.save();

    // 🚀 AUTOMATION CROSS-SYNC HOOK TRIGGER:
    // If you explicitly check a box off to true, fire the background creator hook!
    if (isCompleted === true || isCompleted === 'true') {
      // Passes: Feature/Step Name (e.g. "Setup Redis Caching"), Category, Parent Project Name (e.g. "PageFlow")
      await autoTriggerContentTask(
        targetStep.name || targetStep.title || 'Subfeature Block', 
        'Project', 
        project.title
      );
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("❌ Toggle step automation cross-sync failed:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveToDb = async (req, res) => {
  try {
    let { title, description, techStack, modules } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Missing required project title identifier." });
    }

    // 1. Unpack stringified payloads if passed from n8n
    if (typeof modules === 'string') {
      try { modules = JSON.parse(modules); } catch (e) { console.error(e); }
    }
    if (typeof techStack === 'string') {
      try { techStack = JSON.parse(techStack); } catch (e) { console.error(e); }
    }

    // 2. Wrap lone objects into explicit arrays
    if (modules && typeof modules === 'object' && !Array.isArray(modules)) {
      modules = [modules];
    }
    if (techStack && typeof techStack === 'object' && !Array.isArray(techStack)) {
      techStack = [techStack];
    }

    const rawModules = [modules].flat().filter(Boolean);
    const cleanTechStack = [techStack].flat().filter(Boolean).map(t => String(t));

    // 🎯 3. DATA NORMALIZATION LAYER: Map Gemini outputs into your exact Schema Tiers
    const cleanModules = rawModules.map(mod => {
      // Map 'moduleTitle' to 'title' safely
      const moduleTitle = mod.title || mod.moduleTitle || 'Unnamed Feature Component';
      
      // Transform plain string steps into array objects [{ text: '...' }]
      let rawSteps = mod.steps || [];
      if (typeof rawSteps === 'string') rawSteps = [rawSteps];
      
      const cleanSteps = rawSteps.map(step => {
        if (typeof step === 'object' && step !== null) {
          return {
            text: step.text || step.name || JSON.stringify(step),
            isCompleted: typeof step.isCompleted === 'boolean' ? step.isCompleted : false
          };
        }
        // If it's a raw text string, transform it into a proper sub-document shape
        return { text: String(step), isCompleted: false };
      });

      // Format resources link strings safely into [{ label, url }] shapes if present
      let cleanResources = [];
      if (typeof mod.resources === 'string') {
        cleanResources = mod.resources.split(',').map(link => ({
          label: 'Documentation',
          url: link.trim()
        }));
      } else if (Array.isArray(mod.resources)) {
        cleanResources = mod.resources.map(r => ({
          label: typeof r === 'object' ? r.label || 'Resource' : 'Resource',
          url: typeof r === 'object' ? r.url || String(r) : String(r)
        }));
      }

      return {
        title: moduleTitle,
        techStack: Array.isArray(mod.techStack) ? mod.techStack.map(t => String(t)) : [],
        steps: cleanSteps,
        resources: cleanResources
      };
    });

    console.log(`⚙️ Schema Enforcer Normalized: ${cleanModules.length} modules matched to structural tiers.`);

    // 4. Upsert your fully-sanitized blueprint document into Atlas
    const updatedProject = await Project.findOneAndUpdate(
      { title: title.trim() },
      {
        title: title.trim(),
        description: description || '',
        techStack: cleanTechStack,
        modules: cleanModules,
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    console.log(`📥 Project Database Sync: Successfully staged blueprint metrics for "${updatedProject.title}"`);
    return res.status(200).json({
      success: true,
      message: "Project blueprint indexed perfectly in MongoDB Atlas.",
      data: updatedProject
    });

  } catch (error) {
    console.error("❌ Mongoose validation dropped the write pass:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerAIBlueprint = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        // 1. Shoot the raw user input directly to the new n8n automation webhook path
        const n8nResponse = await axios.post(process.env.N8N_BLUEPRINT_WEBHOOK, {
            title,
            description: description || "No description provided"
        });

        // 2. Return the structured steps generated by n8n back to the client UI if needed
        return res.status(200).json({
            success: true,
            message: "AI workflow executed successfully!",
            data: n8nResponse.data
        });

    } catch (error) {
        console.error("Error in triggerAIBlueprint:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to trigger AI pipeline",
            error: error.message
        });
    }
};

// Dedicated controller to parse and persist n8n's generated AI roadmaps
exports.createAITask = async (req, res) => {
    try {
        const { title, description, steps } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Objective title is required." });
        }

        // 1. Map n8n's flat string array cleanly to your TaskStepSchema format
        const formattedSteps = Array.isArray(steps) 
            ? steps.map(stepText => ({
                text: stepText,
                isCompleted: false
              }))
            : [];

        // 2. Instantiate using the clean, standalone Task model
        const newLifeTask = new Task({
            title: title.trim(),
            description: description ? description.trim() : "AI Generated Workspace Roadmap",
            steps: formattedSteps,
            status: "pending"
        });

        // 3. Commit the record directly to your new tasks collection in MongoDB
        await newLifeTask.save();

        return res.status(201).json({
            success: true,
            message: "Standalone AI Task successfully committed to database layers!",
            data: newLifeTask
        });

    } catch (error) {
        console.error("Database Save Error in createAITask:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to persist standalone task schema to MongoDB.",
            error: error.message
        });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        // Read all items from the isolated tasks collection, sorted newest first
        const tasks = await Task.find().sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error("Error reading tasks collection:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve task records from database cluster.",
            error: error.message
        });
    }
};

// Toggle the completion status of an individual step inside a task
exports.toggleTaskStep = async (req, res) => {
    try {
        const { taskId, stepId } = req.body;

        if (!taskId || !stepId) {
            return res.status(400).json({ success: false, message: "Missing taskId or stepId parameters." });
        }

        // 1. Locate the specific task document
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Target task not found." });
        }

        // 2. Locate the specific step subdocument inside the task's steps array
        const step = task.steps.id(stepId);
        if (!step) {
            return res.status(404).json({ success: false, message: "Target step checklist item not found." });
        }

        // 3. Flip the boolean flag state (true -> false or false -> true)
        step.isCompleted = !step.isCompleted;

        // 4. If all steps in this task are now marked completed, automatically update the parent status
        const allDone = task.steps.every(s => s.isCompleted);
        task.status = allDone ? "completed" : "in-progress";
        task.updatedAt = new Date();

        // 5. Commit the modified subdocument modifications back to MongoDB Atlas
        await task.save();

        return res.status(200).json({
            success: true,
            message: "Step checklist state inverted successfully!",
            data: task
        });

    } catch (error) {
        console.error("Error updating step checklist status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to modify checkbox state inside database layer.",
            error: error.message
        });
    }
};

exports.getDailySummary = async (req, res) => {
    try {
        // 1. Fetch current IST date string (e.g., "2026-06-04" when running at 2 AM)
        const currentISTDateString = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        
        // 2. Compute Target Yesterday String precisely ("2026-06-03")
        const todayMidnight = new Date(`${currentISTDateString}T00:00:00+05:30`);
        const yesterdayMidnight = new Date(todayMidnight.getTime());
        yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
        
        const reportingDateString = yesterdayMidnight.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // Explicitly "2026-06-03"

        // 3. Build Safe JavaScript ISO objects for query thresholds
        const startWindow = new Date(`${reportingDateString}T00:00:00+05:30`);
        const endWindow = new Date(`${reportingDateString}T23:59:59.999+05:30`);

        // 4. Fire standard task queries
        const completedTasksToday = await Task.find({
            status: 'completed',
            updatedAt: { $gte: startWindow, $lte: endWindow }
        });
        const activeTasksCount = await Task.countDocuments({ status: { $ne: 'completed' } });

        // 🛡️ RECTIFIED DSA FIND LOGIC:
        // We use standard Date comparison operators which Mongo converts automatically 
        // to match both '+00:00' strings and native Date types seamlessly!
        const dsaSolvedTodayList = await DSA.find({
            status: 'Completed', 
            lastSolvedAt: { $gte: startWindow, $lte: endWindow }
        });

        console.log(`🔍 Verified DSA Matches Found: ${dsaSolvedTodayList.length}`);

        // 5. PROJECTS PROGRESS TRACKING
        const activeProjects = await Project.find();
        let projectProgressPoints = 0;
        activeProjects.forEach(project => {
            if (project.modules) {
                project.modules.forEach(mod => {
                    if (mod.steps) {
                        const stepsDoneYesterday = mod.steps.filter(step => 
                            step.isCompleted === true && 
                            step.updatedAt &&
                            new Date(step.updatedAt) >= startWindow && 
                            new Date(step.updatedAt) <= endWindow
                        ).length;
                        projectProgressPoints += stepsDoneYesterday;
                    }
                });
            }
        });

        const contentStagedYesterday = await contetModel.find({
            status: 'Staged',
            updatedAt: { $gte: startWindow, $lte: endWindow }
        });

        const targetBodyTelemetry = await BodyLog.findOne({ date: reportingDateString });

        return res.status(200).json({
            success: true,
            telemetry: {
                date: reportingDateString, // Will be explicitly "2026-06-03"
                tasksCompletedCount: completedTasksToday.length,
                completedTaskTitles: completedTasksToday.map(t => t.title),
                remainingActiveTasks: activeTasksCount,
                totalActiveProjects: activeProjects.length,
                dsaSolvedCount: dsaSolvedTodayList.length,
                dsaProblemTitles: dsaSolvedTodayList.map(p => p.title),
                projectDeltaPoints: projectProgressPoints, 
                contentStagedCount: contentStagedYesterday.length,
                dailyCaloriesScore: targetBodyTelemetry ? targetBodyTelemetry.totalCaloriesIntake : 0,
                dailyProteinScore: targetBodyTelemetry ? targetBodyTelemetry.totalProteinIntake : 0
            }
        });

    } catch (error) {
        console.error("Failed to generate complete telemetry overview arrays:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};
