const mongoose = require('mongoose');

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
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    time: {
      type: String,
      required: true,
    },
    wasteTypes: {
      type: [String],
      default: ['General'],
    },
    notes: {
      type: String,
      default: '',
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

wasteScheduleSchema.index({ area: 1, isActive: 1 });

module.exports = mongoose.model('WasteSchedule', wasteScheduleSchema);
