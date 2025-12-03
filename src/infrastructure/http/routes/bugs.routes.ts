import { Router } from 'express';
import { BugsController } from '../controllers/BugsController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const bugsController = new BugsController();

router.use(authenticate);

router.get('/', bugsController.list);
router.post('/', checkPermission('bugs:create'), bugsController.create);
router.patch('/:id', checkPermission('bugs:update'), bugsController.update);

export default router;
