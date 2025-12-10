import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import { getActivityQueryValidator } from "@modules/dashboard/infrastructure/validators/DashboardValidators";

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard stats
router.get("/stats", dashboardController.getStats);

// Activity feed
router.get(
  "/activity",
  getActivityQueryValidator,
  validateRequest,
  dashboardController.getActivity
);

// Sprint summary
router.get("/sprint-summary", dashboardController.getSprintSummary);

export default router;
