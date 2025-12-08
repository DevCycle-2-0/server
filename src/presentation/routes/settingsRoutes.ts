import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  updateUserSettingsSchema,
  updateUserProfileSchema,
  changePasswordSchema,
  updateWorkspaceSettingsSchema,
  addIntegrationSchema,
} from '@application/validators/SettingsValidator';

const router = Router();
const settingsController = new SettingsController();

router.use(authenticate);

// User settings
router.get('/users/me/settings', settingsController.getUserSettings);
router.patch(
  '/users/me/settings',
  validate(updateUserSettingsSchema),
  settingsController.updateUserSettings
);
router.patch(
  '/users/me/profile',
  validate(updateUserProfileSchema),
  settingsController.updateUserProfile
);
router.post('/users/me/avatar', settingsController.uploadAvatar);
router.delete('/users/me/avatar', settingsController.deleteAvatar);
router.post(
  '/users/me/change-password',
  validate(changePasswordSchema),
  settingsController.changePassword
);
router.get('/users/me/sessions', settingsController.listSessions);
router.delete('/users/me/sessions/:id', settingsController.revokeSession);

// Workspace settings
router.get('/workspaces/:id/settings', settingsController.getWorkspaceSettings);
router.patch(
  '/workspaces/:id/settings',
  validate(updateWorkspaceSettingsSchema),
  settingsController.updateWorkspaceSettings
);
router.get('/workspaces/:id/integrations', settingsController.listIntegrations);
router.post(
  '/workspaces/:id/integrations',
  validate(addIntegrationSchema),
  settingsController.addIntegration
);
router.delete(
  '/workspaces/:id/integrations/:integrationId',
  settingsController.removeIntegration
);

export default router;
