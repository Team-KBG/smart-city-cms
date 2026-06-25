const express = require("express");
const router = express.Router();
const wasteController = require("../controllers/wasteController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public - anyone can view collection schedules
router.get("/schedules", wasteController.getSchedules);

// Admin-only schedule management
router.post("/schedules", protect, adminOnly, wasteController.createSchedule);
router.put("/schedules/:id", protect, adminOnly, wasteController.updateSchedule);
router.delete("/schedules/:id", protect, adminOnly, wasteController.deleteSchedule);

// Citizen can request pickup (must be logged in)
router.post("/pickup-requests", protect, wasteController.requestPickup);

// Admin can view and update pickup requests
router.get("/pickup-requests", protect, adminOnly, wasteController.getPickupRequests);
router.put("/pickup-requests/:id", protect, adminOnly, wasteController.updatePickupRequest);

module.exports = router;
