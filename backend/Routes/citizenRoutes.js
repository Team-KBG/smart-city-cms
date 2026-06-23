const express = require("express");
const router = express.Router();
const citizenController = require("../controllers/citizenController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public leaderboard
router.get("/leaderboard", citizenController.getLeaderboard);

// Authenticated citizen can get their own profile
router.get("/me/profile", protect, citizenController.getMyProfile);

// Admin can look up any citizen by email
router.get("/:email", protect, adminOnly, citizenController.getCitizen);

module.exports = router;
