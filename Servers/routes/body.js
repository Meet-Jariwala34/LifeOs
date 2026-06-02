const express = require('express');
const router = express.Router();
const { logWorkout, updateDailyMacros, getTodayBodyLog } = require('../controller/body.controller');

router.post('/workout', logWorkout);
router.post('/macros', updateDailyMacros); // Changed to point directly to direct metrics
router.get('/today', getTodayBodyLog);

module.exports = router;