import { Router } from 'express';
import { TasksController } from '../controllers/TasksController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const tasksController = new TasksController();

router.use(authenticate);

router.get('/', tasksController.list);
router.post('/', checkPermission('tasks:create'), tasksController.create);
router.patch('/:id/status', checkPermission('tasks:update'), tasksController.updateStatus);

export default router;
