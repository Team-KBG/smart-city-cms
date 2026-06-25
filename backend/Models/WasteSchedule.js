const mongoose = require("mongoose");

const wasteScheduleSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const wastePickupRequestSchema = new mongoose.Schema(
  {
    citizenName: {
      type: String,
      required: true,
    },
    citizenEmail: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      default: "General",
    },
    preferredDate: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed"],
      default: "Pending",
    },
    // Link to registered user
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WasteSchedule = mongoose.model("WasteSchedule", wasteScheduleSchema);
const WastePickupRequest = mongoose.model("WastePickupRequest", wastePickupRequestSchema);

module.exports = { WasteSchedule, WastePickupRequest };
