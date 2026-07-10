import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from '../schemas/booking.schema.js';
import { createBooking, updateBookingStatus } from '../controllers/booking.controller.js';

const router = Router();

// Ensure all booking routes require authentication
router.use(authenticate);

// Customers can create bookings
router.post(
  '/', 
  authorizeRoles('customer'), 
  validate(createBookingSchema), 
  createBooking
);

// Workers and Admins can accept/reject bookings
router.patch(
  '/:id/status', 
  authorizeRoles('worker', 'admin'), 
  validate(updateBookingStatusSchema), 
  updateBookingStatus
);

export default router;
