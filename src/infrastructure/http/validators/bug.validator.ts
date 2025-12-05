import { z } from 'zod';

/**
 * Schema for creating a new bug
 * POST /bugs
 */
export const createBugSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(500),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    severity: z.enum(['minor', 'major', 'critical', 'blocker']),
    environment: z.string().max(100).optional(),
    browser: z.string().max(100).optional(),
    os: z.string().max(100).optional(),
    stepsToReproduce: z.string().optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Schema for updating a bug
 * PATCH /bugs/:id
 */
export const updateBugSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(500).optional(),
    description: z.string().min(10).optional(),
    severity: z.enum(['minor', 'major', 'critical', 'blocker']).optional(),
    environment: z.string().max(100).optional(),
    browser: z.string().max(100).optional(),
    os: z.string().max(100).optional(),
    stepsToReproduce: z.string().optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Schema for updating bug status
 * PATCH /bugs/:id/status
 */
export const updateBugStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    status: z.enum([
      'open',
      'investigating',
      'in_progress',
      'fixed',
      'retest',
      'closed',
      'wontfix',
    ]),
  }),
});

/**
 * Schema for assigning bug to user
 * PATCH /bugs/:id/assign
 */
export const assignBugSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    assigneeId: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Schema for linking bug to feature
 * POST /bugs/:id/link-feature
 */
export const linkFeatureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    featureId: z.string().uuid('Invalid feature ID'),
  }),
});

/**
 * Schema for assigning bug to sprint
 * POST /bugs/:id/assign-sprint
 */
export const assignSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    sprintId: z.string().uuid('Invalid sprint ID'),
  }),
});

/**
 * Schema for adding retest result
 * POST /bugs/:id/retest
 */
export const addRetestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  body: z.object({
    passed: z.boolean(),
    notes: z.string().max(1000).optional(),
  }),
});

/**
 * Schema for getting bugs list with filters
 * GET /bugs
 */
export const listBugsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z
      .enum(['open', 'investigating', 'in_progress', 'fixed', 'retest', 'closed', 'wontfix'])
      .optional(),
    severity: z.enum(['minor', 'major', 'critical', 'blocker']).optional(),
    productId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    sprintId: z.string().uuid().optional(),
    environment: z.string().optional(),
    search: z.string().optional(),
  }),
});

/**
 * Schema for getting bug statistics
 * GET /bugs/statistics
 */
export const bugStatisticsSchema = z.object({
  query: z.object({
    productId: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

/**
 * Schema for uploading attachment
 * POST /bugs/:id/attachments
 */
export const uploadAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
  }),
  // File upload validation would be handled by multer middleware
});

/**
 * Schema for deleting attachment
 * DELETE /bugs/:id/attachments/:attachmentId
 */
export const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid bug ID'),
    attachmentId: z.string(),
  }),
});
