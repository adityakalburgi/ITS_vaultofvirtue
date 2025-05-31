/**
 * Session management utilities for challenge sessions
 */

// Calculate session expiration time (1 hour from start)
exports.calculateSessionExpiry = () => {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
  return expiryTime;
};

// Check if session is expired
exports.isSessionExpired = (sessionExpiry) => {
  if (!sessionExpiry) return true;
  
  const now = new Date();
  const expiry = typeof sessionExpiry === 'string' 
    ? new Date(sessionExpiry) 
    : sessionExpiry.toDate ? sessionExpiry.toDate() : sessionExpiry;
    
  return now > expiry;
};