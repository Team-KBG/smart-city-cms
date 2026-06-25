const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes (no auth required)
router.get("/stats/dashboard", complaintController.getDashboardStats);
router.get("/heatmap", complaintController.getHeatMapData);
router.get("/nearby/check", complaintController.checkNearby);
router.post("/categorize/preview", complaintController.previewCategorization);
router.get("/track/:complaintId", complaintController.getComplaintByComplaintId);
router.get("/my", protect, complaintController.getMyComplaints);
router.get("/:id", complaintController.getComplaintById);

// Citizen routes (authentication required)
router.get("/", protect, complaintController.getAllComplaints);
router.post("/", protect, upload.single("image"), complaintController.createComplaint);
router.post("/:id/support", protect, complaintController.upvoteComplaint);

// Admin routes (admin only)
router.put("/:id", protect, adminOnly, complaintController.updateComplaint);
router.delete("/:id", protect, adminOnly, complaintController.deleteComplaint);

module.exports = router;
