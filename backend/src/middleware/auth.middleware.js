const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  const bearerToken = token.split(' ')[1] || token;

  jwt.verify(bearerToken, process.env.JWT_SECRET || 'supersecret_jwt_key_prototype', (err, decoded) => {
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
