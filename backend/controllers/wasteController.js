const WasteSchedule = require('../Models/WasteSchedule');
const WastePickupRequest = require('../Models/WastePickupRequest');
const logger = require('../utils/logger');

exports.getSchedules = async (req, res, next) => {
  try {
    const schedules = await WasteSchedule.find({ isActive: true }).sort({ area: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const schedule = await WasteSchedule.create(req.body);
    logger.info('Waste schedule created', { area: schedule.area, day: schedule.day });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await WasteSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await WasteSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.status(200).json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
};

exports.requestPickup = async (req, res, next) => {
  try {
    const request = await WastePickupRequest.create(req.body);
    logger.info('Pickup request created', { email: request.citizenEmail, area: request.area });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.getPickupRequests = async (req, res, next) => {
  try {
    const { status, email, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (email) filter.citizenEmail = email;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      WastePickupRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WastePickupRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePickupRequest = async (req, res, next) => {
  try {
    const request = await WastePickupRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};
