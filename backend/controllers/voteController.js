const PublicVote = require("../Models/PublicVote");
const { PUBLIC_VOTE_TYPES } = require("../config/constants");

exports.getVoteTypes = (req, res) => {
  res.status(200).json({ success: true, data: PUBLIC_VOTE_TYPES });
};

exports.createOrVote = async (req, res) => {
  try {
    const { voteType, location, description } = req.body;
    const citizenEmail = req.user.email;

    if (!voteType || !location) {
      return res.status(400).json({ success: false, message: "voteType and location are required" });
    }

    if (!PUBLIC_VOTE_TYPES.includes(voteType)) {
      return res.status(400).json({ success: false, message: "Invalid vote type" });
    }

    const cleanLocation = location.trim().replace(/\s+/g, ' ');

    let vote = await PublicVote.findOne({
      voteType,
      location: { $regex: new RegExp(`^${cleanLocation.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (vote) {
      if (citizenEmail && vote.voters.includes(citizenEmail)) {
        return res.status(400).json({ success: false, message: "You have already voted for this" });
      }
      vote.voteCount += 1;
      if (citizenEmail) vote.voters.push(citizenEmail);
      await vote.save();
    } else {
      vote = await PublicVote.create({
        voteType,
        location: cleanLocation,
        description: description || "",
        citizenEmail: citizenEmail || "",
        voters: citizenEmail ? [citizenEmail] : [],
      });
    }

    res.status(201).json({ success: true, data: vote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopVotes = async (req, res) => {
  try {
    const topVotes = await PublicVote.find().sort({ voteCount: -1 }).limit(20);
    const byType = {};

    PUBLIC_VOTE_TYPES.forEach((type) => {
      byType[type] = topVotes.filter((v) => v.voteType === type).slice(0, 5);
    });

    res.status(200).json({ success: true, data: { all: topVotes, byType } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllVotes = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [votes, total] = await Promise.all([
      PublicVote.find()
        .sort({ voteCount: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PublicVote.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: votes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: votes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
