// backend/controllers/projectController.js
const Project = require('../model/Project');
const axios = require('axios');

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

    const N8N_WEBHOOK_URL = 'https://meetjariwala34.app.n8n.cloud/webhook-test/LifeOs_architecture';

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

    targetStep.isCompleted = isCompleted;
    project.updatedAt = Date.now();

    await project.save();
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};