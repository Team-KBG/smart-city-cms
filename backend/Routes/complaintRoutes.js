const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const upload = require("../middleware/upload");

router.get("/stats/dashboard", complaintController.getDashboardStats);
router.get("/heatmap", complaintController.getHeatMapData);
router.get("/nearby/check", complaintController.checkNearby);
router.post("/categorize/preview", complaintController.previewCategorization);

router.get("/", complaintController.getAllComplaints);
router.post("/", upload.single("image"), complaintController.createComplaint);

router.get("/track/:complaintId", complaintController.getComplaintByComplaintId);
router.get("/:id", complaintController.getComplaintById);
router.put("/:id", complaintController.updateComplaint);
router.delete("/:id", complaintController.deleteComplaint);
router.post("/:id/support", complaintController.upvoteComplaint);

module.exports = router;
