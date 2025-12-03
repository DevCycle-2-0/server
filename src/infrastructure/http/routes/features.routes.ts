import { Router } from 'express';
import { FeaturesController } from '../controllers/FeaturesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const featuresController = new FeaturesController();

router.use(authenticate);

router.get('/', featuresController.list);
router.post('/', checkPermission('features:create'), featuresController.create);
router.patch('/:id', checkPermission('features:update'), featuresController.update);
router.post('/:id/vote', featuresController.vote);
router.post('/:id/approve', checkPermission('features:approve'), featuresController.approve);
router.delete('/:id', checkPermission('features:delete'), featuresController.delete);

export default router;
