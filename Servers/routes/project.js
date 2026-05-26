// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getAllProjects, addProjectWithAI, toggleStepCompletion } = require('../controller/Project.controller');

router.get('/all', getAllProjects);
router.post('/add', addProjectWithAI);
router.put('/:projectId/modules/:moduleId/steps/:stepId', toggleStepCompletion);

module.exports = router;