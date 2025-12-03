import { Router } from 'express';
import { WorkspacesController } from '../controllers/WorkspacesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();
const workspacesController = new WorkspacesController();

router.use(authenticate);

router.post('/', workspacesController.create);
router.get('/current', workspacesController.getCurrent);
router.patch('/:id', checkPermission('workspaces:update'), workspacesController.update);
router.delete('/:id', checkPermission('workspaces:delete'), workspacesController.delete);

export default router;
