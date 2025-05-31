const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');
const { isSessionExpired } = require('../utils/sessionManager');

// Authenticate JWT token
exports.protect = async (req, res, next) => {
  try {
    // Allow OPTIONS method to pass through for CORS preflight
    if (req.method === 'OPTIONS') {
      return next();
    }

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return handleResponse(res, 401, false, 'Not authorized, no token');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    // Attach user to request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      username: decoded.username,
      isAdmin: decoded.isAdmin || false
    };
    
    next();
  } catch (error) {
    return handleResponse(res, 401, false, 'Not authorized, token failed');
  }
};

// Check if user is admin
exports.admin = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return handleResponse(res, 403, false, 'Not authorized as admin');
  }
  next();
};

// Validate session is not expired for challenges
exports.validateSession = async (req, res, next) => {
  try {
    // Skip session validation for admins
    if (req.user.isAdmin) {
      return next();
    }
    
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    
    if (!userData.sessionExpiry) {
      return handleResponse(res, 400, false, 'Challenge session not started');
    }
    
    if (isSessionExpired(userData.sessionExpiry)) {
      return handleResponse(res, 403, false, 'Challenge session expired');
    }
    
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};