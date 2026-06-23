const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.post('/', authMiddleware, feedbackController.createFeedback);
router.get('/stats', authMiddleware, adminMiddleware, feedbackController.getFeedbackStats);
router.get('/complaint/:id', feedbackController.getComplaintFeedback);

module.exports = router;
