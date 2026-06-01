// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getAllProjects, addProjectWithAI, toggleStepCompletion , saveToDb} = require('../controller/Project.controller');

router.get('/all', getAllProjects);
router.post('/add', addProjectWithAI);
router.put('/:projectId/modules/:moduleId/steps/:stepId', toggleStepCompletion);
router.post('/database/save', saveToDb);

module.exports = router;