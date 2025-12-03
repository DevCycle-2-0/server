import { z } from 'zod';

export const createSprintSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    startDate: z.string().datetime('Invalid date format'),
    duration: z.enum(['1_week', '2_weeks', '3_weeks', '4_weeks']),
    goal: z.string().optional(),
  }),
});
