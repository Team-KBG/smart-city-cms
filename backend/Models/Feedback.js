const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true, // One feedback per complaint
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      default: null,
    },
    citizenEmail: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      maxlength: 500,
    },
    department: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ department: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ citizen: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
