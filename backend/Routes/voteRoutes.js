const express = require("express");
const router = express.Router();

const voteController = require("../controllers/voteController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Public ──────────────────────────────────────────────────
// Returns list of supported vote/proposal types
router.get("/types", voteController.getVoteTypes);

// ── Authenticated (all logged-in users) ─────────────────────
// Browse all proposals (with hasVoted flag per user)
router.get("/", protect, voteController.getAllVotes);

// ── Citizen only (admin blocked inside controller) ───────────
// Create a new community proposal
router.post("/", protect, voteController.createProposal);

// Cast a vote on an existing proposal by MongoDB _id
router.post("/:id/vote", protect, voteController.castVote);

// ── Admin only ───────────────────────────────────────────────
// Update proposal status (Active → In Progress → Approved → Completed | Rejected)
router.patch("/:id/status", protect, adminOnly, voteController.updateProposalStatus);

// Delete a proposal
router.delete("/:id", protect, adminOnly, voteController.deleteProposal);

// Kept for backward compatibility
router.get("/top", protect, voteController.getTopVotes);

module.exports = router;