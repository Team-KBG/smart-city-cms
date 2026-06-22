const express = require("express");
const router = express.Router();
const citizenController = require("../controllers/citizenController");

router.get("/leaderboard", citizenController.getLeaderboard);
router.get("/:email", citizenController.getCitizen);

module.exports = router;
