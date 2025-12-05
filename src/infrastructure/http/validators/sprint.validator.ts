import { z } from 'zod';

/**
 * Schema for creating a sprint
 * POST /sprints
 */
export const createSprintSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    name: z.string().min(3, 'Sprint name must be at least 3 characters').max(255),
    startDate: z.string().datetime('Invalid date format'),
    duration: z.enum(['1_week', '2_weeks', '3_weeks', '4_weeks']),
    goal: z.string().max(1000).optional(),
  }),
});

/**
 * Schema for updating a sprint
 * PATCH /sprints/:id
 */
export const updateSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
  body: z.object({
    name: z.string().min(3, 'Sprint name must be at least 3 characters').max(255).optional(),
    goal: z.string().max(1000).optional(),
  }),
});

/**
 * Schema for getting sprint by ID
 * GET /sprints/:id
 */
export const getSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
});

/**
 * Schema for listing sprints with filters
 * GET /sprints
 */
export const listSprintsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
    productId: z.string().uuid().optional(),
  }),
});

/**
 * Schema for adding task to sprint
 * POST /sprints/:id/tasks
 */
export const addTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
  body: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
});

/**
 * Schema for removing task from sprint
 * DELETE /sprints/:id/tasks/:taskId
 */
export const removeTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
    taskId: z.string().uuid('Invalid task ID'),
  }),
});

/**
 * Schema for adding bug to sprint
 * POST /sprints/:id/bugs
 */
export const addBugSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
  body: z.object({
    bugId: z.string().uuid('Invalid bug ID'),
  }),
});

/**
 * Schema for removing bug from sprint
 * DELETE /sprints/:id/bugs/:bugId
 */
export const removeBugSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
    bugId: z.string().uuid('Invalid bug ID'),
  }),
});

/**
 * Schema for saving retrospective
 * POST /sprints/:id/retrospective
 */
export const saveRetrospectiveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
  body: z.object({
    wentWell: z.array(z.string().min(1).max(500)).min(0).max(50),
    needsImprovement: z.array(z.string().min(1).max(500)).min(0).max(50),
    actionItems: z.array(z.string().min(1).max(500)).min(0).max(50),
  }),
});

/**
 * Schema for getting retrospective
 * GET /sprints/:id/retrospective
 */
export const getRetrospectiveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sprint ID'),
  }),
});
