const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schemas');

router.post('/login', authController.loginLimiter, validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
