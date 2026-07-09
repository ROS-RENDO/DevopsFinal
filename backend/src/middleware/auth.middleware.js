const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
  // Check for token in cookies first, then fallback to Authorization header
  let token = req.cookies?.token;
  
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn('Authentication Failure: No token provided', { ip: req.ip, path: req.originalUrl });
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    logger.warn('Authentication Failure: Invalid or expired token', { ip: req.ip, path: req.originalUrl });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      logger.warn('Authorization Failure: Access denied', {
        userId: req.userId,
        attemptedRole: req.userRole,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
        ip: req.ip
      });
      return res.status(403).json({ error: `Access denied. Require one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  roleMiddleware
};
