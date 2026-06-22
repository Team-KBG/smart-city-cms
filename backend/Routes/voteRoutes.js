const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");

router.get("/types", voteController.getVoteTypes);
router.get("/top", voteController.getTopVotes);
router.get("/", voteController.getAllVotes);
router.post("/", voteController.createOrVote);

module.exports = router;
