// src/modules/analytics/presentation/routes/analytics.routes.ts

import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  getOverviewQueryValidator,
  getVelocityQueryValidator,
  getBugResolutionQueryValidator,
  getFeatureCompletionQueryValidator,
  getReleaseFrequencyQueryValidator,
  getTimeTrackingQueryValidator,
  getTeamPerformanceQueryValidator,
  exportAnalyticsValidator,
} from "@modules/analytics/infrastructure/validators/AnalyticsValidators";

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authenticate);

// Overview
router.get(
  "/overview",
  getOverviewQueryValidator,
  validateRequest,
  analyticsController.getOverview
);

// Velocity
router.get(
  "/velocity",
  getVelocityQueryValidator,
  validateRequest,
  analyticsController.getVelocity
);

// Burndown
router.get("/burndown/:sprintId", analyticsController.getBurndown);

// Bug resolution trends
router.get(
  "/bugs/resolution",
  getBugResolutionQueryValidator,
  validateRequest,
  analyticsController.getBugResolution
);

// Feature completion
router.get(
  "/features/completion",
  getFeatureCompletionQueryValidator,
  validateRequest,
  analyticsController.getFeatureCompletion
);

// Release frequency
router.get(
  "/releases/frequency",
  getReleaseFrequencyQueryValidator,
  validateRequest,
  analyticsController.getReleaseFrequency
);

// Team workload
router.get("/team/workload", analyticsController.getTeamWorkload);

// Time tracking
router.get(
  "/time-tracking",
  getTimeTrackingQueryValidator,
  validateRequest,
  analyticsController.getTimeTracking
);

// Product health
router.get("/products/health", analyticsController.getProductHealth);

// Team performance
router.get(
  "/team/performance",
  getTeamPerformanceQueryValidator,
  validateRequest,
  analyticsController.getTeamPerformance
);

// Export
router.post(
  "/export",
  exportAnalyticsValidator,
  validateRequest,
  analyticsController.exportAnalytics
);

export default router;
