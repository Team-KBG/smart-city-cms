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
    const { voteType, location, description, citizenEmail } = req.body;

    if (!voteType || !location || !citizenEmail) {
      return res.status(400).json({
        success: false,
        message: "Email, voteType and location are required",
      });
    }

    if (!PUBLIC_VOTE_TYPES.includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type",
      });
    }

    const email = citizenEmail.trim().toLowerCase();

    let vote = await PublicVote.findOne({
      voteType,
      location,
    });

    if (vote) {
      if (vote.voters.includes(email)) {
        return res.status(400).json({
          success: false,
          message: "You have already voted for this proposal",
        });
      }

      vote.voteCount += 1;
      vote.voters.push(email);

      await vote.save();
    } else {
      vote = await PublicVote.create({
        voteType,
        location,
        description: description || "",
        citizenEmail: email,
        voteCount: 1,
        voters: [email],
      });
    }

    res.status(201).json({
      success: true,
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
    const topVotes = await PublicVote.find()
      .sort({ voteCount: -1 })
      .limit(20);

    const byType = {};

    PUBLIC_VOTE_TYPES.forEach((type) => {
      byType[type] = topVotes
        .filter((v) => v.voteType === type)
        .slice(0, 5);
    });

    res.status(200).json({
      success: true,
      data: {
        all: topVotes,
        byType,
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
    const votes = await PublicVote.find().sort({
      voteCount: -1,
    });

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};