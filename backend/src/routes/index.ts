import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookingRoutes from './booking.routes.js';
import mfaRoutes from './mfa.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/mfa', mfaRoutes);
router.use('/bookings', bookingRoutes);

// Example of a protected route
router.get('/protected', authenticate, (req, res) => {
  res.json({
    status: 'success',
    message: 'You have accessed a protected route!',
    user: req.user,
  });
});

export default router;
