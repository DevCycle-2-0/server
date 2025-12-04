import { Router } from 'express';
import { ReleasesController } from '../controllers/ReleasesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const releasesController = new ReleasesController();

router.use(authenticate);

router.get('/', releasesController.list);
router.get('/:id', releasesController.get);
router.post('/', checkPermission('releases:create'), releasesController.create);
router.patch('/:id', checkPermission('releases:update'), releasesController.update);
router.delete('/:id', checkPermission('releases:delete'), releasesController.delete);
router.post('/:id/deploy', checkPermission('releases:deploy'), releasesController.deploy);
router.post('/:id/rollback', checkPermission('releases:deploy'), releasesController.rollback);
router.get('/:id/deployments', releasesController.getDeployments);

export default router;
