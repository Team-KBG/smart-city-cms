const mongoose = require("mongoose");
const { PUBLIC_VOTE_TYPES } = require("../config/constants");

const publicVoteSchema = new mongoose.Schema(
  {
    voteType: {
      type: String,
      enum: PUBLIC_VOTE_TYPES,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    voteCount: {
      type: Number,
      default: 1,
    },
    voters: [
      {
        type: String,
      },
    ],
    citizenEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

publicVoteSchema.index({ voteType: 1, voteCount: -1 });
publicVoteSchema.index({ voteType: 1, location: 1 });

module.exports = mongoose.model("PublicVote", publicVoteSchema);
