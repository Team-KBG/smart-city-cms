const mongoose = require('mongoose');

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
      enum: ['General', 'Recyclable', 'Organic', 'Bulk', 'Hazardous'],
      default: 'General',
    },
    preferredDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

wastePickupRequestSchema.index({ status: 1 });
wastePickupRequestSchema.index({ citizenEmail: 1 });

module.exports = mongoose.model('WastePickupRequest', wastePickupRequestSchema);
