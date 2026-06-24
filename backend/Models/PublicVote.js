const mongoose = require("mongoose");
const { PUBLIC_VOTE_TYPES } = require("../config/constants");

const PROPOSAL_STATUSES = ["Active", "In Progress", "Approved", "Rejected", "Completed"];

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
      trim: true,
    },

    voteCount: {
      type: Number,
      default: 1,
    },

    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Who created this proposal
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Admin-managed status lifecycle
    status: {
      type: String,
      enum: PROPOSAL_STATUSES,
      default: "Active",
    },

    // Admin notes when changing status
    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup + prevent exact duplicates
publicVoteSchema.index({ voteType: 1, location: 1 }, { unique: false });
publicVoteSchema.index({ voteCount: -1 });

module.exports = mongoose.model("PublicVote", publicVoteSchema);