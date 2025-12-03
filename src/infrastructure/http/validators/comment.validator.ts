import { z } from 'zod';

export const createCommentSchema = z.object({
  params: z.object({
    entityType: z.enum(['feature', 'task', 'bug']),
    entityId: z.string().uuid('Invalid entity ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty'),
    parentId: z.string().uuid().optional(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    entityType: z.enum(['feature', 'task', 'bug']),
    entityId: z.string().uuid(),
    commentId: z.string().uuid('Invalid comment ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty'),
  }),
});
