const mongoose = require('mongoose');
const { REPUTATION_LEVELS } = require('../config/constants');

const citizenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'department_staff'],
      default: 'citizen',
    },
    department: {
      type: String,
      default: null, // Only for department_staff role
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
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
citizenSchema.index({ points: -1 });
citizenSchema.index({ role: 1 });
citizenSchema.index({ level: 1 });

module.exports = mongoose.model('Citizen', citizenSchema);
