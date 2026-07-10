import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    serviceDetails: z.string().min(10, 'Please provide more details about the service required'),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Booking ID must be a number'),
  }),
});
