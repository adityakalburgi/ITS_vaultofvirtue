const { db, admin } = require('../config/firebase');
const { handleResponse } = require('../utils/responseHandler');
const { isSessionExpired } = require('../utils/sessionManager');

// Log security event
const logSecurityEvent = async (type, userId, details) => {
  await db.collection('securityLogs').add({
    type,
    userId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    details
  });
};

// Check for tab switching and other security violations
exports.monitorSession = async (req, res, next) => {
  try {
    // Skip for admin users
    if (req.user.isAdmin) {
      return next();
    }
    
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    
    // Check if session has expired
    if (userData.sessionExpiry && isSessionExpired(userData.sessionExpiry)) {
      return handleResponse(res, 403, false, 'Session expired');
    }
    
    // Check if tab switch count exceeds limit
    const MAX_TAB_SWITCHES = 3;
    if (userData.tabSwitchCount >= MAX_TAB_SWITCHES) {
      // Log security event
      await logSecurityEvent(
        'EXCESSIVE_TAB_SWITCHING', 
        req.user.uid, 
        `User exceeded maximum tab switches (${userData.tabSwitchCount}/${MAX_TAB_SWITCHES})`
      );
      
      return handleResponse(res, 403, false, 'Session terminated due to excessive tab switching');
    }
    
    next();
  } catch (error) {
    console.error('Session monitoring error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};

// Initialize session for a challenge
exports.initSession = async (req, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return handleResponse(res, 404, false, 'User not found');
    }
    
    const userData = userDoc.data();
    
    // If session already exists and not expired, continue
    if (userData.sessionExpiry && !isSessionExpired(userData.sessionExpiry)) {
      return next();
    }
    
    // Calculate new session expiry (1 hour from now)
    const now = new Date();
    const sessionExpiry = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Update user with new session
    await userRef.update({
      sessionExpiry,
      tabSwitchCount: 0,
      sessionStarted: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log session start
    await logSecurityEvent(
      'SESSION_STARTED', 
      req.user.uid, 
      'Challenge session initialized'
    );
    
    req.sessionExpiry = sessionExpiry;
    next();
  } catch (error) {
    console.error('Session initialization error:', error);
    return handleResponse(res, 500, false, 'Server error');
  }
};