import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/velocity', analyticsController.getVelocity);
router.get('/burndown', analyticsController.getBurndown);
router.get('/bugs/resolution', analyticsController.getBugResolution);
router.get('/team/workload', analyticsController.getTeamWorkload);

export default router;

// src/infrastructure/http/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/sprint-summary', dashboardController.getSprintSummary);

export default router;
