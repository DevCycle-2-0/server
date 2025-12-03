import { z } from 'zod';

export const createBugSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    severity: z.enum(['minor', 'major', 'critical', 'blocker']),
    environment: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }),
});

export const updateBugSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    status: z
      .enum(['open', 'investigating', 'in_progress', 'fixed', 'retest', 'closed', 'wontfix'])
      .optional(),
    severity: z.enum(['minor', 'major', 'critical', 'blocker']).optional(),
  }),
});
