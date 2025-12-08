import { Router } from 'express';
import { TimeLogController } from '../controllers/TimeLogController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import { logTimeSchema } from '@application/validators/TimeLogValidator';

const router = Router();
const timeLogController = new TimeLogController();

router.use(authenticate);

router.post(
  '/:workspaceId/tasks/:taskId/time-logs',
  validate(logTimeSchema),
  timeLogController.logTime
);
router.get(
  '/:workspaceId/tasks/:taskId/time-logs',
  timeLogController.getTimeLogs
);
router.delete(
  '/:workspaceId/tasks/:taskId/time-logs/:id',
  timeLogController.deleteTimeLog
);

export default router;
