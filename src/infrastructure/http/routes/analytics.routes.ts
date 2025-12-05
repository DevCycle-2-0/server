import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

// Existing routes
router.get('/overview', analyticsController.getOverview);
router.get('/velocity', analyticsController.getVelocity);
router.get('/burndown', analyticsController.getBurndown);
router.get('/bugs/resolution', analyticsController.getBugResolution);

// New routes
router.get('/features/completion', analyticsController.getFeatureCompletion);
router.get('/releases/frequency', analyticsController.getReleaseFrequency);
router.get('/time-tracking', analyticsController.getTimeTracking);
router.get('/products/health', analyticsController.getProductsHealth);
router.get('/team/performance', analyticsController.getTeamPerformance);
router.post('/export', analyticsController.exportAnalytics);

// Keep existing
router.get('/team/workload', analyticsController.getTeamWorkload);

export default router;
