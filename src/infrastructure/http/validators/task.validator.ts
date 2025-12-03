import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    featureId: z.string().uuid().optional(),
    sprintId: z.string().uuid().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    status: z.enum(['backlog', 'todo', 'in_progress', 'code_review', 'qa_testing', 'done']),
  }),
});
