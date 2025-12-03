import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    platform: z.enum(['android', 'ios', 'web', 'dashboard', 'backend', 'api']),
    description: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    icon: z.string().optional(),
  }),
});
