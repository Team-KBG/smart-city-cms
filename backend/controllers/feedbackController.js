const Feedback = require('../Models/Feedback');
const Complaint = require('../Models/Complaint');
const logger = require('../utils/logger');

/** POST /api/feedback — Submit feedback for a resolved complaint */
exports.createFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comment } = req.body;
    if (!complaintId || !rating) {
      return res.status(400).json({ success: false, message: 'complaintId and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Verify complaint ownership
    const isOwner = (req.user.email && complaint.citizenEmail && req.user.email.toLowerCase().trim() === complaint.citizenEmail.toLowerCase().trim()) ||
                    (complaint.citizen && req.user._id.toString() === complaint.citizen.toString());
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only submit feedback for your own complaints.' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved complaints.' });
    }
    if (complaint.feedbackSubmitted) {
      return res.status(409).json({ success: false, message: 'Feedback has already been submitted for this complaint.' });
    }

    const feedbackData = {
      complaint: complaintId,
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
      department: complaint.department || '',
      citizenEmail: complaint.citizenEmail,
    };
    if (req.user) feedbackData.citizen = req.user._id;

    const feedback = await Feedback.create(feedbackData);
    complaint.feedbackSubmitted = true;
    await complaint.save();

    logger.info('Feedback submitted', { complaintId, rating });

    res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
  } catch (err) {
    next(err);
  }
};

/** GET /api/feedback/stats — Department feedback statistics (admin) */
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$department',
          avgRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

/** GET /api/feedback/complaint/:id — Get feedback for one complaint */
exports.getComplaintFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ complaint: req.params.id });
    res.status(200).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};
