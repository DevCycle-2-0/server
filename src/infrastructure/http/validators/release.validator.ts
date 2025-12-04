import { z } from 'zod';

export const createReleaseSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    version: z.string().regex(/^\d+\.\d+\.\d+/, 'Invalid semver format (e.g., 1.0.0)'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    releaseNotes: z.string().optional(),
    targetDate: z.string().datetime().optional(),
  }),
});

export const updateReleaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid release ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    releaseNotes: z.string().optional(),
    targetDate: z.string().datetime().optional(),
  }),
});

export const deployReleaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid release ID'),
  }),
  body: z.object({
    environment: z.enum(['staging', 'production']),
    notes: z.string().optional(),
  }),
});

export const rollbackReleaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid release ID'),
  }),
  body: z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    targetVersion: z.string().optional(),
  }),
});
