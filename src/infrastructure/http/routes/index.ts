import { Router } from 'express';
import authRoutes from './auth.routes';
import productsRoutes from './products.routes';
import featuresRoutes from './features.routes';
import sprintsRoutes from './sprints.routes';
import tasksRoutes from './tasks.routes';
import bugsRoutes from './bugs.routes';

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
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/features', featuresRoutes);
router.use('/sprints', sprintsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/bugs', bugsRoutes);

export default router;
