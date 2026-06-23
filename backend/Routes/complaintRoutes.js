const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const upload = require('../middleware/upload');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { adminMiddleware, deptMiddleware } = require('../middleware/adminMiddleware');

// Public routes
router.get('/stats/dashboard', complaintController.getDashboardStats);
router.get('/heatmap', complaintController.getHeatMapData);
router.get('/nearby/check', complaintController.checkNearby);
router.post('/categorize/preview', complaintController.previewCategorization);
router.get('/track/:complaintId', complaintController.getComplaintByComplaintId);

// Admin-only routes
router.get('/overdue', authMiddleware, adminMiddleware, complaintController.getOverdueComplaints);
router.get('/dept/:deptName', authMiddleware, deptMiddleware, complaintController.getComplaintsByDepartment);

// List all complaints (admin sees all; public sees paginated subset)
router.get('/', complaintController.getAllComplaints);

// Create complaint — optional auth (logged-in users get ref attached)
router.post('/', optionalAuth, upload.single('image'), complaintController.createComplaint);

// Single complaint
router.get('/:id', complaintController.getComplaintById);

// Protected actions
router.put('/:id', authMiddleware, deptMiddleware, complaintController.updateComplaint);
router.delete('/:id', authMiddleware, adminMiddleware, complaintController.deleteComplaint);
router.post('/:id/support', optionalAuth, complaintController.upvoteComplaint);

module.exports = router;
