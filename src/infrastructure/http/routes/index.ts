import { Router } from 'express';
import authRoutes from './auth.routes';
import workspacesRoutes from './workspaces.routes';
import workspaceInvitesRoutes from './workspace-invites.routes';
import productsRoutes from './products.routes';
import featuresRoutes from './features.routes';
import sprintsRoutes from './sprints.routes';
import tasksRoutes from './tasks.routes';
import bugsRoutes from './bugs.routes';
import teamRoutes from './team.routes';
import releasesRoutes from './releases.routes';
import analyticsRoutes from './analytics.routes';
import dashboardRoutes from './dashboard.routes';
import settingsRoutes from './settings.routes';
import onboardingRoutes from './onboarding.routes';
import timeLogsRoutes from './time-logs.routes';
import commentsRoutes from './comments.routes';
import billingRoutes from './billing.routes'; // NEW

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        database: 'connected',
        redis: process.env.REDIS_ENABLED === 'true' ? 'enabled' : 'disabled',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
      },
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/workspaces', workspacesRoutes);
router.use('/workspaces', workspaceInvitesRoutes);
router.use('/products', productsRoutes);
router.use('/features', featuresRoutes);
router.use('/sprints', sprintsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/bugs', bugsRoutes);
router.use('/team', teamRoutes);
router.use('/releases', releasesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/billing', billingRoutes);
router.use('/users', onboardingRoutes);
router.use('/', timeLogsRoutes);
router.use('/', commentsRoutes);

export default router;
