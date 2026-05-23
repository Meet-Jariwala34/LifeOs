const express = require('express');
const router = express.Router();
const {getDailyDeck, updateProblemStatus} = require("../controller/DSA.controller");

router.get("/getDeck", getDailyDeck );
router.post("/updateStatus", updateProblemStatus);

module.exports = router;