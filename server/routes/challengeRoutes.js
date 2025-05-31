const express = require('express');
const router = express.Router();
const { 
  getChallenges,
  getChallengeById,
  submitSolution,
  getUserCompletedChallenges,
  getChallengeHint,
  getUserProgress,
  getChallengeLeaderboard
} = require('../controllers/challengeController');
const { protect, validateSession } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getChallenges);

// Protected routes
router.get('/user/completed', protect, getUserCompletedChallenges);
router.get('/user/progress', protect, getUserProgress);
router.get('/:id', protect, validateSession, getChallengeById);
router.get('/:challengeId/hints/:hintIndex', protect, validateSession, getChallengeHint);
router.get('/:challengeId/leaderboard', protect, getChallengeLeaderboard);
router.post('/submit', protect, validateSession, submitSolution);

module.exports = router;