import { Router } from 'express';
import { WorkspaceInvitesController } from '../controllers/WorkspaceInvitesController';
import { authenticate } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const controller = new WorkspaceInvitesController();

router.use(authenticate);

// Validation schemas
const inviteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer']),
  }),
});

const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().uuid('Invalid token'),
  }),
});

const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workspace ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer']),
  }),
});

// Routes
router.post(
  '/:id/invites',
  checkPermission('workspaces:invite'),
  validate(inviteUserSchema),
  controller.inviteUser
);

router.get('/:id/invites', checkPermission('workspaces:read'), controller.listInvites);

router.post('/invites/accept', validate(acceptInviteSchema), controller.acceptInvite);

router.delete('/invites/:inviteId', checkPermission('workspaces:invite'), controller.cancelInvite);

router.get('/:id/members', checkPermission('workspaces:read'), controller.listMembers);

router.delete(
  '/:id/members/:userId',
  checkPermission('workspaces:manage_members'),
  controller.removeMember
);

router.patch(
  '/:id/members/:userId/role',
  checkPermission('workspaces:manage_members'),
  validate(updateRoleSchema),
  controller.updateMemberRole
);

export default router;
