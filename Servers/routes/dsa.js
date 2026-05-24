const express = require('express');
const router = express.Router();
const {getDailyDeck, updateProblemStatus , getProblemHistory} = require("../controller/DSA.controller");

router.get("/getDeck", getDailyDeck );
router.post("/updateStatus", updateProblemStatus);
router.get('/history', getProblemHistory);

module.exports = router;