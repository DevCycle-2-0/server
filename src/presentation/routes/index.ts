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
import billingRoutes from './billingRoutes';

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
router.use('/workspaces', billingRoutes);

export default router;
