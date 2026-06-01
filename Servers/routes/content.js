// backend/routes/content.routes.js
const express = require('express');
const router = express.Router();
const {
  getActiveContentTasks,
  createContentTask,
  completeContentTask,
  getContentHistory,
  stageContentTextOnly, 
  syncN8nAssetOutput,
  archiveContentTask
} = require('../controller/content.controller');

router.get('/active', getActiveContentTasks);
router.post('/create', createContentTask);
router.post('/complete/:id', completeContentTask);
router.get('/history', getContentHistory);
router.post('/stage-text', stageContentTextOnly);
router.put('/archive/:id',archiveContentTask);

module.exports = router;