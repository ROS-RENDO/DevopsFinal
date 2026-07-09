const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const { validate } = require('../middleware/validate.middleware');
const { loginSchema, registerSchema } = require('../validations/auth.validation');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit to 5 requests
  keyGenerator: (req) => {
    // Block by email if provided, otherwise fallback to IP
    return req.body?.email || req.ip;
  },
  validate: { keyGeneratorIpFallback: false }, // Prevent IPv6 warning
  message: { error: 'Too many login attempts for this account, please try again after 15 minutes' }
});

const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit to 3 email requests
  keyGenerator: (req) => {
    // Block by email (for register) or tempToken (for resend OTP), fallback to IP
    return req.body?.email || req.body?.tempToken || req.ip;
  },
  validate: { keyGeneratorIpFallback: false }, // Prevent IPv6 warning
  message: { error: 'Too many email requests for this account, please try again after 10 minutes' }
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.me);

// MFA Routes
router.post('/mfa/resend', emailLimiter, authController.generateMfa);
router.post('/mfa/validate', authController.validateMfa);

module.exports = router;
