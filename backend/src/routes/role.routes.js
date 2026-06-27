const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { verifyToken, roleMiddleware } = require('../middleware/auth.middleware');

// Customer action: Make a booking request
// Only customers (or admins) can do this
router.post('/customer/booking', verifyToken, roleMiddleware(['customer', 'admin']), roleController.makeBookingRequest);

// Company action: Add staff
// Only companies (or admins) can do this
router.post('/company/staff', verifyToken, roleMiddleware(['company', 'admin']), roleController.addStaff);

// Worker action: Accept a booking request
// Only workers (or admins) can do this
router.post('/worker/booking/:id/accept', verifyToken, roleMiddleware(['worker', 'admin']), roleController.acceptBooking);

module.exports = router;
