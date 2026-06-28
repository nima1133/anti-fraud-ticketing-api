import { z } from 'zod';

export const updateEventInput = z.object({
  title: z.string().trim().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  location: z.string().trim().min(3).max(200).optional(),
  date: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: 'Event date must be in the future',
    })
    .optional(),
  capacity: z.number().int().positive().max(500).optional(),
});
export type UpdateEventDto = z.infer<typeof updateEventInput>;

export const createEventInput = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().min(10),
  location: z.string().trim().min(3).max(200),
  date: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Event date must be in the future',
  }),
  capacity: z.number().int().positive().max(500),
});
export type CreateEventDto = z.infer<typeof createEventInput>;
