const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  loginAsAdmin, 
  getCurrentUser,
  trackTabSwitch
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', loginAsAdmin);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/tab-switch', protect, trackTabSwitch);

module.exports = router;