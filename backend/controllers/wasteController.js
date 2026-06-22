const { WasteSchedule, WastePickupRequest } = require("../Models/WasteSchedule");

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await WasteSchedule.find({ isActive: true }).sort({ area: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = await WasteSchedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await WasteSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await WasteSchedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestPickup = async (req, res) => {
  try {
    const request = await WastePickupRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPickupRequests = async (req, res) => {
  try {
    const requests = await WastePickupRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePickupRequest = async (req, res) => {
  try {
    const request = await WastePickupRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
