import { Router } from 'express';
import { SprintsController } from '../controllers/SprintsController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const sprintsController = new SprintsController();

router.use(authenticate);

router.get('/', sprintsController.list);
router.post('/', checkPermission('sprints:create'), sprintsController.create);
router.post('/:id/start', checkPermission('sprints:update'), sprintsController.start);
router.get('/:id/metrics', sprintsController.getMetrics);

export default router;
