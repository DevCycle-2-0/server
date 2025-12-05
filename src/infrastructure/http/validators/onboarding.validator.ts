import { z } from 'zod';

export const updateOnboardingSchema = z.object({
  body: z.object({
    step: z.number().int().min(1).max(5),
    completed: z.boolean(),
  }),
});
