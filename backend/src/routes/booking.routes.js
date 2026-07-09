const express = require('express');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/bookings
router.post('/', async (req, res, next) => {
  try {
    const { serviceId, serviceName, customerEmail, date } = req.body;

    if (!serviceId || !serviceName || !date) {
      return res.status(400).json({ error: 'serviceId, serviceName, and date are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        serviceName,
        customerEmail: customerEmail || 'guest@example.com',
        date,
      }
    });

    logger.info(`New booking created: ${booking.id} for service ${serviceName}`);

    res.status(201).json({
      message: 'Booking successful',
      booking
    });
  } catch (error) {
    logger.error(`Booking Error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
