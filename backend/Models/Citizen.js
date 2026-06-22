const mongoose = require("mongoose");
const { REPUTATION_LEVELS } = require("../config/constants");

const citizenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      default: REPUTATION_LEVELS.BRONZE.name,
    },
    complaintsSubmitted: {
      type: Number,
      default: 0,
    },
    complaintsResolved: {
      type: Number,
      default: 0,
    },
    upvotesGiven: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Citizen", citizenSchema);
