const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin-only analytics
router.get("/", protect, adminOnly, analyticsController.getAnalytics);
router.get("/departments/ranking", protect, adminOnly, analyticsController.getDepartmentRanking);

module.exports = router;
