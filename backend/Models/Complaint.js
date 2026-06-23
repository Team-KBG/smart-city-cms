const mongoose = require('mongoose');
const { STATUS_VALUES, PRIORITY_LEVELS } = require('../config/constants');

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
      default: '',
    },
    area: {
      type: String,
      default: 'Unknown',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
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
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: 'Low',
    },
    effectivePriority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: 'Low',
    },
    supportCount: {
      type: Number,
      default: 0,
    },
    supportedBy: [
      {
        type: String,
      },
    ],
    isEmergency: {
      type: Boolean,
      default: false,
    },
    // Legacy text fields — kept for backward compatibility
    citizenEmail: {
      type: String,
      default: '',
    },
    citizenName: {
      type: String,
      default: '',
    },
    // Structured reference to Citizen document (preferred)
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
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
    slaDeadline: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', default: null },
        note: String,
      },
    ],
    autoCategorized: {
      type: Boolean,
      default: false,
    },
    feedbackSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
complaintSchema.index({ location: '2dsphere' });
// Query optimization indexes
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ citizen: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ area: 1 });
complaintSchema.index({ isEmergency: -1, createdAt: -1 });
complaintSchema.index({ status: 1, isEmergency: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
