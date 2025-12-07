import { Router } from 'express';
import { TimeLogController } from '../controllers/TimeLogController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const timeLogController = new TimeLogController();

router.use(authenticate);

router.post('/:workspaceId/tasks/:taskId/time-logs', timeLogController.logTime);
router.get(
  '/:workspaceId/tasks/:taskId/time-logs',
  timeLogController.getTimeLogs
);
router.delete(
  '/:workspaceId/tasks/:taskId/time-logs/:id',
  timeLogController.deleteTimeLog
);

export default router;

// src/presentation/routes/teamRoutes.ts
import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const teamController = new TeamController();

router.use(authenticate);

router.get('/:workspaceId/team/members', teamController.listMembers);
router.get('/:workspaceId/team/members/:id', teamController.getMemberProfile);
router.patch(
  '/:workspaceId/team/members/:id',
  teamController.updateMemberProfile
);
router.get(
  '/:workspaceId/team/members/:id/workload',
  teamController.getMemberWorkload
);
router.get('/:workspaceId/team/workload', teamController.getTeamWorkload);
router.get('/:workspaceId/team/skills', teamController.listSkills);
router.post('/:workspaceId/team/skills', teamController.addSkill);

export default router;

// src/presentation/routes/settingsRoutes.ts
import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const settingsController = new SettingsController();

router.use(authenticate);

// User settings
router.get('/users/me/settings', settingsController.getUserSettings);
router.patch('/users/me/settings', settingsController.updateUserSettings);
router.patch('/users/me/profile', settingsController.updateUserProfile);
router.post('/users/me/avatar', settingsController.uploadAvatar);
router.delete('/users/me/avatar', settingsController.deleteAvatar);
router.post('/users/me/change-password', settingsController.changePassword);
router.get('/users/me/sessions', settingsController.listSessions);
router.delete('/users/me/sessions/:id', settingsController.revokeSession);

// Workspace settings
router.get('/workspaces/:id/settings', settingsController.getWorkspaceSettings);
router.patch(
  '/workspaces/:id/settings',
  settingsController.updateWorkspaceSettings
);
router.get('/workspaces/:id/integrations', settingsController.listIntegrations);
router.post('/workspaces/:id/integrations', settingsController.addIntegration);
router.delete(
  '/workspaces/:id/integrations/:integrationId',
  settingsController.removeIntegration
);

export default router;

// Update src/presentation/routes/index.ts to include new routes
import { Router } from 'express';
import authRoutes from './authRoutes';
import workspaceRoutes from './workspaceRoutes';
import productRoutes from './productRoutes';
import featureRoutes from './featureRoutes';
import sprintRoutes from './sprintRoutes';
import taskRoutes from './taskRoutes';
import bugRoutes from './bugRoutes';
import releaseRoutes from './releaseRoutes';
import commentRoutes from './commentRoutes';
import timeLogRoutes from './timeLogRoutes';
import teamRoutes from './teamRoutes';
import analyticsRoutes from './analyticsRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

// Authentication
router.use('/auth', authRoutes);

// Settings (at root level for /users/me paths)
router.use(settingsRoutes);

// Workspaces
router.use('/workspaces', workspaceRoutes);

// All workspace-scoped resources
router.use('/workspaces', productRoutes);
router.use('/workspaces', featureRoutes);
router.use('/workspaces', sprintRoutes);
router.use('/workspaces', taskRoutes);
router.use('/workspaces', bugRoutes);
router.use('/workspaces', releaseRoutes);
router.use('/workspaces', commentRoutes);
router.use('/workspaces', timeLogRoutes);
router.use('/workspaces', teamRoutes);
router.use('/workspaces', analyticsRoutes);

export default router;
