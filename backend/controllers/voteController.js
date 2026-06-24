const PublicVote = require("../Models/PublicVote");
const { PUBLIC_VOTE_TYPES } = require("../config/constants");

const PROPOSAL_STATUSES = ["Active", "In Progress", "Approved", "Rejected", "Completed"];

// ── GET /api/votes/types ─────────────────────────────────────────────────────
// Public — returns supported vote types
exports.getVoteTypes = (req, res) => {
  res.status(200).json({ success: true, data: PUBLIC_VOTE_TYPES });
};

// ── GET /api/votes ───────────────────────────────────────────────────────────
// Authenticated — returns ALL proposals sorted by vote count desc
// Attaches hasVoted flag per current user
exports.getAllVotes = async (req, res) => {
  try {
    const userId = req.user._id;

    const votes = await PublicVote.find()
      .sort({ voteCount: -1, createdAt: -1 })
      .populate("createdBy", "name");

    const data = votes.map((vote) => ({
      ...vote.toObject(),
      hasVoted: vote.voters.some((id) => id.toString() === userId.toString()),
      // strip voters array from response (privacy + payload size)
      voters: undefined,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/votes ──────────────────────────────────────────────────────────
// Authenticated (citizen only) — create a NEW proposal
// Admin is blocked from creating proposals
exports.createProposal = async (req, res) => {
  try {
    // Admin cannot create proposals — they manage them
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot create citizen proposals. Use the admin management panel.",
      });
    }

    const { voteType, location, description } = req.body;

    // Validate required fields
    if (!voteType || !location) {
      return res.status(400).json({
        success: false,
        message: "voteType and location are required.",
      });
    }

    if (!PUBLIC_VOTE_TYPES.includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${PUBLIC_VOTE_TYPES.join(", ")}`,
      });
    }

    const locationTrimmed = location.trim();
    if (locationTrimmed.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Location must be at least 5 characters.",
      });
    }

    // Create new proposal — creator automatically gets 1 vote
    const vote = await PublicVote.create({
      voteType,
      location: locationTrimmed,
      description: description ? description.trim() : "",
      voteCount: 1,
      voters: [req.user._id],
      createdBy: req.user._id,
      status: "Active",
    });

    await vote.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      message: "Proposal created! Your vote has been cast automatically.",
      data: { ...vote.toObject(), hasVoted: true, voters: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/votes/:id/vote ─────────────────────────────────────────────────
// Authenticated (citizen only) — cast a vote on an existing proposal by ID
// One vote per user per proposal, strictly enforced
exports.castVote = async (req, res) => {
  try {
    // Admin cannot vote
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot participate in citizen voting.",
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const vote = await PublicVote.findById(id);
    if (!vote) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    if (vote.status === "Rejected" || vote.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: `This proposal is ${vote.status} and no longer accepting votes.`,
      });
    }

    // Check duplicate vote
    const alreadyVoted = vote.voters.some((id) => id.toString() === userId.toString());
    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this proposal.",
      });
    }

    // Atomically increment vote count and push voter
    vote.voteCount += 1;
    vote.voters.push(userId);
    await vote.save();

    res.status(200).json({
      success: true,
      message: "Vote cast successfully! 👍",
      data: {
        _id: vote._id,
        voteCount: vote.voteCount,
        hasVoted: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/votes/:id/status ──────────────────────────────────────────────
// Admin only — update proposal status + optional note
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required." });
    }

    if (!PROPOSAL_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${PROPOSAL_STATUSES.join(", ")}`,
      });
    }

    const vote = await PublicVote.findById(req.params.id);
    if (!vote) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    vote.status = status;
    if (adminNote !== undefined) vote.adminNote = adminNote.trim();
    await vote.save();

    res.status(200).json({
      success: true,
      message: `Proposal marked as ${status}.`,
      data: { _id: vote._id, status: vote.status, adminNote: vote.adminNote },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/votes/:id ────────────────────────────────────────────────────
// Admin only — delete/remove a proposal
exports.deleteProposal = async (req, res) => {
  try {
    const vote = await PublicVote.findByIdAndDelete(req.params.id);
    if (!vote) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }
    res.status(200).json({ success: true, message: "Proposal deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/votes/top ───────────────────────────────────────────────────────
// Kept for backward compatibility — redirects to getAllVotes logic
exports.getTopVotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const votes = await PublicVote.find()
      .sort({ voteCount: -1 })
      .limit(50)
      .populate("createdBy", "name");

    const data = votes.map((vote) => ({
      ...vote.toObject(),
      hasVoted: vote.voters.some((id) => id.toString() === userId.toString()),
      voters: undefined,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};