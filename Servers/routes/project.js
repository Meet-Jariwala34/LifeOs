// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getAllProjects, addProjectWithAI, toggleStepCompletion , saveToDb, triggerAIBlueprint, createAITask, getAllTasks, toggleTaskStep, getDailySummary} = require('../controller/Project.controller');

router.get('/all', getAllProjects);
router.post('/add', addProjectWithAI);
router.put('/:projectId/modules/:moduleId/steps/:stepId', toggleStepCompletion);
router.post('/database/save', saveToDb);

//Task
router.post('/input', triggerAIBlueprint);
router.post('/create', createAITask);
router.get('/allTask', getAllTasks);
router.patch('/toggle-step', toggleTaskStep);

//get all data
router.get('/daily-summary', getDailySummary);

module.exports = router;