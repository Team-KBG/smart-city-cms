const Citizen = require("../Models/Citizen");
const { getOrCreateCitizen } = require("../services/reputationService");

exports.getMyProfile = async (req, res) => {
  try {
    const citizen = await getOrCreateCitizen(req.user.email, req.user.name);

    if (!citizen) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, data: citizen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCitizen = async (req, res) => {
  try {
    const { email } = req.params;
    const citizen = await getOrCreateCitizen(email);

    if (!citizen) {
      return res.status(404).json({ success: false, message: "Citizen not found" });
    }

    res.status(200).json({ success: true, data: citizen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const citizens = await Citizen.find({ points: { $gt: 0 } })
      .sort({ points: -1 })
      .limit(20)
      .select("-__v");

    res.status(200).json({ success: true, count: citizens.length, data: citizens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
