const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/login', loginLimiter, authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
