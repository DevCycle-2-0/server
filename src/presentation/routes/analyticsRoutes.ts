import { Router } from 'express';
import { EnhancedAnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import { exportDataSchema } from '@application/validators/AnalyticsValidator';

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
router.post(
  '/:workspaceId/analytics/export',
  validate(exportDataSchema),
  analyticsController.exportData
);

export default router;
