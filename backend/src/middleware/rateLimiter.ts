import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP + Email to 5 login requests per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP and Account, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Generate a unique key using the IP and the email provided in the body
    const email = req.body?.email || 'unknown';
    return `${ipKeyGenerator(req.ip || 'unknown')}_${email}`;
  },
});
