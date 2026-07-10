import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
