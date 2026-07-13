import { Request, Response } from 'express';
import prisma from '../utils/db.js';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceDetails, specialInstructions } = req.body;
    
    // Ensure only a customer is creating the booking (fallback check, though middleware should handle this)
    if (!req.user || req.user.role !== 'customer') {
      res.status(403).json({ status: 'error', message: 'Forbidden - Only customers can create bookings' });
      return;
    }

    const newBooking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        serviceDetails,
        specialInstructions,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Ensure only worker or admin can update
    if (!req.user || (req.user.role !== 'worker' && req.user.role !== 'admin')) {
      res.status(403).json({ status: 'error', message: 'Forbidden - Only staff can accept or reject bookings' });
      return;
    }

    const bookingId = parseInt(id as string, 10);

    const existingBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!existingBooking) {
      res.status(404).json({ status: 'error', message: 'Booking not found' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        workerId: req.user.id, // Assign the staff member who accepted/rejected it
      },
    });

    res.json({
      status: 'success',
      message: `Booking ${status.toLowerCase()} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    let bookings;
    if (req.user.role === 'customer') {
      bookings = await prisma.booking.findMany({
        where: { customerId: req.user.id },
        include: { worker: { select: { name: true, email: true } } },
      });
    } else {
      bookings = await prisma.booking.findMany({
        include: { customer: { select: { name: true, email: true } } },
      });
    }

    res.json({
      status: 'success',
      data: bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
