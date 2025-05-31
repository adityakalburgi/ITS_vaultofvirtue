// leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUserLeaderboard, 
  getTeamLeaderboard, 
  getChallengeLeaderboard,
  getUserRanking,
  getTeamDetails
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/users', getUserLeaderboard);
router.get('/teams', getTeamLeaderboard);
router.get('/teams/:teamId', getTeamDetails);
router.get('/challenges/:challengeId', getChallengeLeaderboard);

// Protected routes
router.get('/me', protect, getUserRanking);

module.exports = router;
