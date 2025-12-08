import { Router } from 'express';
import { WorkspaceController } from '../controllers/WorkspaceController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@application/validators/WorkspaceValidator';

const router = Router();
const workspaceController = new WorkspaceController();

router.use(authenticate);

router.get('/', workspaceController.list);
router.post('/', validate(createWorkspaceSchema), workspaceController.create);
router.get('/:id', workspaceController.getById);
router.patch(
  '/:id',
  validate(updateWorkspaceSchema),
  workspaceController.update
);
router.delete('/:id', workspaceController.delete);

// Members
router.get('/:id/members', workspaceController.listMembers);
router.patch(
  '/:id/members/:userId',
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);
router.delete('/:id/members/:userId', workspaceController.removeMember);

// Invites
router.post(
  '/:id/invites',
  validate(inviteMemberSchema),
  workspaceController.inviteMember
);
router.get('/:id/invites', workspaceController.listInvites);
router.delete('/:id/invites/:inviteId', workspaceController.cancelInvite);
router.post('/join', workspaceController.acceptInvite);

export default router;
