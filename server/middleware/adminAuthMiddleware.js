const jwt = require('jsonwebtoken');
const { handleResponse } = require('../utils/responseHandler');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return handleResponse(res, 401, false, 'Authorization header missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return handleResponse(res, 401, false, 'Token missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return handleResponse(res, 403, false, 'Access denied: Admins only');
    }

    req.user = decoded;
    console.log("Admin auth middleware: user authorized", decoded);
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return handleResponse(res, 401, false, 'Invalid or expired token');
  }
};

module.exports = adminAuthMiddleware;
