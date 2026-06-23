const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/types", voteController.getVoteTypes);
router.get("/top", voteController.getTopVotes);
router.get("/", voteController.getAllVotes);
router.post("/", authMiddleware, voteController.createOrVote);

module.exports = router;
