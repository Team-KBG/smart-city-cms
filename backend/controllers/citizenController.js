const Citizen = require('../Models/Citizen');
const Complaint = require('../Models/Complaint');

exports.getCitizen = async (req, res, next) => {
  try {
    const { email } = req.params;
    const citizen = await Citizen.findOne({ email }).select('-password');

    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }

    res.status(200).json({ success: true, data: citizen });
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const citizens = await Citizen.find({ role: 'citizen', isActive: true })
      .select('-password -phone')
      .sort({ points: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: citizens });
  } catch (err) {
    next(err);
  }
};

/** GET /api/citizens/me — Current user profile with stats */
exports.getMyProfile = async (req, res, next) => {
  try {
    const citizen = await Citizen.findById(req.user._id).select('-password');
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, data: citizen });
  } catch (err) {
    next(err);
  }
};

/** GET /api/citizens/my-complaints — Complaints filed by the logged-in user */
exports.getMyComplaints = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Match complaints by citizenEmail OR by the citizen ObjectId reference
    const orConditions = [{ citizenEmail: req.user.email }];
    if (req.user._id) {
      orConditions.push({ citizen: req.user._id });
    }
    const filter = { $or: orConditions };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-supportedBy -__v'),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: complaints,
    });
  } catch (err) {
    next(err);
  }
};
