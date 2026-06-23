const express = require("express");
const router = express.Router();

const voteController = require("../controllers/voteController");
const { protect } = require("../middleware/authMiddleware");

// Public - vote types for display
router.get("/types", voteController.getVoteTypes);

// Authenticated - view and vote (must be logged in)
router.get("/top", protect, voteController.getTopVotes);
router.get("/", protect, voteController.getAllVotes);

// Authenticated - cast a vote
router.post("/", protect, voteController.createOrVote);

module.exports = router;