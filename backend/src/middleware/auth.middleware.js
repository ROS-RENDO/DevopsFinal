require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  // Check cookies first, fallback to Authorization header
  const token = req.cookies?.token || req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  const bearerToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }

  jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Require correct role' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  roleMiddleware
};
