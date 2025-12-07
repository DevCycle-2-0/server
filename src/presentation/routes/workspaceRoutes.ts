import { Router } from 'express';
import { WorkspaceController } from '../controllers/WorkspaceController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const workspaceController = new WorkspaceController();

router.use(authenticate);

router.get('/', workspaceController.list);
router.post('/', workspaceController.create);
router.get('/:id', workspaceController.getById);
router.patch('/:id', workspaceController.update);
router.delete('/:id', workspaceController.delete);

// Members
router.get('/:id/members', workspaceController.listMembers);
router.patch('/:id/members/:userId', workspaceController.updateMemberRole);
router.delete('/:id/members/:userId', workspaceController.removeMember);

// Invites
router.post('/:id/invites', workspaceController.inviteMember);
router.get('/:id/invites', workspaceController.listInvites);
router.delete('/:id/invites/:inviteId', workspaceController.cancelInvite);
router.post('/join', workspaceController.acceptInvite);

export default router;
