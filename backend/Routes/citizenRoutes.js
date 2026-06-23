const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/leaderboard', citizenController.getLeaderboard);
router.get('/me', authMiddleware, citizenController.getMyProfile);
router.get('/my-complaints', authMiddleware, citizenController.getMyComplaints);
router.get('/:email', citizenController.getCitizen);

module.exports = router;
