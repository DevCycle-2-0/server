import { Router } from 'express';
import { CommentsController } from '../controllers/CommentsController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new CommentsController();

router.use(authenticate);

// Validation schemas
const createCommentSchema = z.object({
  params: z.object({
    entityType: z.enum(['feature', 'task', 'bug']),
    entityId: z.string().uuid('Invalid entity ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(5000),
    parentId: z.string().uuid().optional(),
  }),
});

const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment ID'),
  }),
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
});

// Routes
router.post('/:entityType/:entityId/comments', validate(createCommentSchema), controller.create);
router.get('/:entityType/:entityId/comments', controller.list);
router.patch('/comments/:commentId', validate(updateCommentSchema), controller.update);
router.delete('/comments/:commentId', controller.delete);

export default router;
