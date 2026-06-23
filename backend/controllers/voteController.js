const PublicVote = require("../Models/PublicVote");
const { PUBLIC_VOTE_TYPES } = require("../config/constants");

exports.getVoteTypes = (req, res) => {
  res.status(200).json({
    success: true,
    data: PUBLIC_VOTE_TYPES,
  });
};

exports.createOrVote = async (req, res) => {
  try {
    const { voteType, location, description } = req.body;

    if (!voteType || !location) {
      return res.status(400).json({
        success: false,
        message: "voteType and location are required",
      });
    }

    if (typeof location !== "string" || location.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "location must be a non-empty string",
      });
    }

    if (!PUBLIC_VOTE_TYPES.includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vote type. Must be one of: ${PUBLIC_VOTE_TYPES.join(", ")}`,
      });
    }

    const userId = req.user._id;

    let vote = await PublicVote.findOne({
      voteType,
      location: location.trim(),
    });

    if (vote) {
      const alreadyVoted = vote.voters.some(
        (voterId) => voterId.toString() === userId.toString()
      );

      if (alreadyVoted) {
        return res.status(400).json({
          success: false,
          message: "You have already voted for this proposal",
        });
      }

      vote.voteCount += 1;
      vote.voters.push(userId);

      await vote.save();
    } else {
      vote = await PublicVote.create({
        voteType,
        location: location.trim(),
        description: description ? description.trim() : "",
        voteCount: 1,
        voters: [userId],
      });
    }

    res.status(201).json({
      success: true,
      message: vote.voteCount === 1 ? "Proposal created and vote cast!" : "Vote added successfully!",
      data: vote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTopVotes = async (req, res) => {
  try {
    const userId = req.user._id;

    const topVotes = await PublicVote.find()
      .sort({ voteCount: -1 })
      .limit(20);

    const byType = {};

    PUBLIC_VOTE_TYPES.forEach((type) => {
      byType[type] = topVotes
        .filter((v) => v.voteType === type)
        .slice(0, 5);
    });

    // Attach hasVoted flag for the current user
    const votesWithStatus = topVotes.map((vote) => ({
      ...vote.toObject(),
      hasVoted: vote.voters.some((id) => id.toString() === userId.toString()),
    }));

    const byTypeWithStatus = {};
    PUBLIC_VOTE_TYPES.forEach((type) => {
      byTypeWithStatus[type] = votesWithStatus
        .filter((v) => v.voteType === type)
        .slice(0, 5);
    });

    res.status(200).json({
      success: true,
      data: {
        all: votesWithStatus,
        byType: byTypeWithStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllVotes = async (req, res) => {
  try {
    const userId = req.user._id;

    const votes = await PublicVote.find().sort({
      voteCount: -1,
    });

    const votesWithStatus = votes.map((vote) => ({
      ...vote.toObject(),
      hasVoted: vote.voters.some((id) => id.toString() === userId.toString()),
    }));

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votesWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};