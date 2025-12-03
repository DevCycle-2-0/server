import { z } from 'zod';

export const createFeatureSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().optional(),
  }),
});

export const updateFeatureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});
