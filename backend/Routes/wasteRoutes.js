const express = require("express");
const router = express.Router();
const wasteController = require("../controllers/wasteController");

router.get("/schedules", wasteController.getSchedules);
router.post("/schedules", wasteController.createSchedule);
router.put("/schedules/:id", wasteController.updateSchedule);
router.delete("/schedules/:id", wasteController.deleteSchedule);

router.get("/pickup-requests", wasteController.getPickupRequests);
router.post("/pickup-requests", wasteController.requestPickup);
router.put("/pickup-requests/:id", wasteController.updatePickupRequest);

module.exports = router;
