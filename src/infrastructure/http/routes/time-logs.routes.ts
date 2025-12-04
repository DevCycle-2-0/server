import { Router } from 'express';
import { TimeLogsController } from '../controllers/TimeLogsController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new TimeLogsController();

router.use(authenticate);

// Validation schemas
const createTimeLogSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    hours: z.number().min(0.1).max(24, 'Hours must be between 0.1 and 24'),
    date: z.string().refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, 'Date must be valid and not in the future'),
    description: z.string().max(500).optional(),
  }),
});

// Routes
router.post('/tasks/:taskId/time-logs', validate(createTimeLogSchema), controller.create);
router.get('/tasks/:taskId/time-logs', controller.listByTask);
router.get('/users/:userId/time-logs', controller.listByUser);
router.delete('/time-logs/:id', controller.delete);

export default router;
