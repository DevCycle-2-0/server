import { Router } from 'express';
import authRoutes from './auth.routes';
import workspacesRoutes from './workspaces.routes';
import productsRoutes from './products.routes';
import featuresRoutes from './features.routes';
import sprintsRoutes from './sprints.routes';
import tasksRoutes from './tasks.routes';
import bugsRoutes from './bugs.routes';
import teamRoutes from './team.routes';
import analyticsRoutes from './analytics.routes';
import dashboardRoutes from './dashboard.routes';

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
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/workspaces', workspacesRoutes);
router.use('/products', productsRoutes);
router.use('/features', featuresRoutes);
router.use('/sprints', sprintsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/bugs', bugsRoutes);
router.use('/team', teamRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);

// Comments routes (polymorphic)
router.use('/features/:entityId/comments', (req, res, next) => {
  req.params.entityType = 'feature';
  next();
});
router.use('/tasks/:entityId/comments', (req, res, next) => {
  req.params.entityType = 'task';
  next();
});
router.use('/bugs/:entityId/comments', (req, res, next) => {
  req.params.entityType = 'bug';
  next();
});

export default router;
