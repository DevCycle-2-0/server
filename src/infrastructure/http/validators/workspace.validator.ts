import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Workspace name must be at least 3 characters'),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    settings: z
      .object({
        timezone: z.string().optional(),
        dateFormat: z.string().optional(),
        weekStartsOn: z.number().min(0).max(6).optional(),
        defaultSprintDuration: z.number().min(7).max(28).optional(),
      })
      .optional(),
  }),
});
