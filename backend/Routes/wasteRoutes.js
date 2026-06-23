const express = require("express");
const router = express.Router();
const wasteController = require("../controllers/wasteController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware, deptMiddleware } = require("../middleware/adminMiddleware");

router.get("/schedules", wasteController.getSchedules);
router.post("/schedules", authMiddleware, adminMiddleware, wasteController.createSchedule);
router.put("/schedules/:id", authMiddleware, adminMiddleware, wasteController.updateSchedule);
router.delete("/schedules/:id", authMiddleware, adminMiddleware, wasteController.deleteSchedule);

router.get("/pickup-requests", authMiddleware, deptMiddleware, wasteController.getPickupRequests);
router.post("/pickup-requests", wasteController.requestPickup);
router.put("/pickup-requests/:id", authMiddleware, deptMiddleware, wasteController.updatePickupRequest);

module.exports = router;
