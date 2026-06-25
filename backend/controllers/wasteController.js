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
    const { area, day, time, notes } = req.body;

    if (!area || !day || !time) {
      return res.status(400).json({
        success: false,
        message: "area, day, and time are required",
      });
    }

    const schedule = await WasteSchedule.create({ area, day, time, notes: notes || "" });
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await WasteSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
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
    const schedule = await WasteSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    res.status(200).json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Uses req.user for citizen identity — no manual name/email from body
exports.requestPickup = async (req, res) => {
  try {
    const { address, area, wasteType, preferredDate } = req.body;

    if (!address || !area) {
      return res.status(400).json({
        success: false,
        message: "address and area are required",
      });
    }

    // Use authenticated user's identity
    const citizenName = req.user.name;
    const citizenEmail = req.user.email;

    const request = await WastePickupRequest.create({
      citizenName,
      citizenEmail,
      address: address.trim(),
      area: area.trim(),
      wasteType: wasteType || "General",
      preferredDate: preferredDate || "",
      submittedBy: req.user._id,
    });

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
    const { status } = req.body;
    const validStatuses = ["Pending", "Scheduled", "Completed"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const request = await WastePickupRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Pickup request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
