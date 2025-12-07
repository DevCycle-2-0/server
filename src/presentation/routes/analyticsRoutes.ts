import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

router.get(
  "/:workspaceId/analytics/overview",
  analyticsController.getWorkspaceAnalytics
);

export default router;
