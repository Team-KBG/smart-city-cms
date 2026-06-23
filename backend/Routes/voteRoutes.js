const express = require("express");
const router = express.Router();

const voteController = require("../controllers/voteController");
const { protect } = require("../middleware/authMiddleware");

router.get("/types", voteController.getVoteTypes);
router.get("/top", voteController.getTopVotes);
router.get("/", voteController.getAllVotes);

// Login required for voting
router.post("/", protect, voteController.createOrVote);

module.exports = router;