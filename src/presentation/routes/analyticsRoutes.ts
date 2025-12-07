import { Router } from 'express';
import { EnhancedAnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const analyticsController = new EnhancedAnalyticsController();

router.use(authenticate);

router.get('/:workspaceId/analytics/overview', analyticsController.getOverview);
router.get('/:workspaceId/analytics/velocity', analyticsController.getVelocity);
router.get('/:workspaceId/analytics/bugs', analyticsController.getBugMetrics);
router.get(
  '/:workspaceId/analytics/features',
  analyticsController.getFeatureMetrics
);
router.get(
  '/:workspaceId/analytics/releases',
  analyticsController.getReleaseMetrics
);
router.post('/:workspaceId/analytics/export', analyticsController.exportData);

export default router;
