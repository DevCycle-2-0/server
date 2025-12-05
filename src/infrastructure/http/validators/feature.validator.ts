import { z } from 'zod';

/**
 * Schema for creating a new feature
 * POST /features
 */
export const createFeatureSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(500),
    description: z.string().optional(),
    status: z
      .enum(['idea', 'review', 'approved', 'development', 'testing', 'release', 'live'])
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }),
});

/**
 * Schema for updating a feature
 * PATCH /features/:id
 */
export const updateFeatureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(500).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Schema for updating feature status
 * PATCH /features/:id/status
 */
export const updateFeatureStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    status: z.enum(['idea', 'review', 'approved', 'development', 'testing', 'release', 'live']),
  }),
});

/**
 * Schema for assigning feature to sprint
 * POST /features/:id/assign-sprint
 */
export const assignSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    sprintId: z.string().uuid('Invalid sprint ID'),
  }),
});

/**
 * Schema for approving feature
 * POST /features/:id/approve
 */
export const approveFeatureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    comment: z.string().max(1000).optional(),
  }),
});

/**
 * Schema for rejecting feature
 * POST /features/:id/reject
 */
export const rejectFeatureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid feature ID'),
  }),
  body: z.object({
    reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(1000),
  }),
});

/**
 * Schema for listing features with filters
 * GET /features
 */
export const listFeaturesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z
      .enum(['idea', 'review', 'approved', 'development', 'testing', 'release', 'live'])
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    productId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    sprintId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});
