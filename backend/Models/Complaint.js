const mongoose = require("mongoose");
const { STATUS_VALUES, PRIORITY_LEVELS } = require("../config/constants");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "Pending",
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "Low",
    },
    effectivePriority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "Low",
    },
    supportCount: {
      type: Number,
      default: 0,
    },
    // Uses User ObjectIds for proper auth-based duplicate detection
    supportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEmergency: {
      type: Boolean,
      default: false,
    },
    // citizenEmail kept for notification service compatibility
    citizenEmail: {
      type: String,
      default: "",
    },
    citizenName: {
      type: String,
      default: "",
    },
    // Link complaint to registered user
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    autoCategorized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ status: 1 });
complaintSchema.index({ isEmergency: -1, createdAt: -1 });
complaintSchema.index({ submittedBy: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
