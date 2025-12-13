import { Router } from "express";
import { FeatureController } from "../controllers/FeatureController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  updateFeatureValidator,
  updateFeatureStatusValidator,
  assignSprintValidator,
  approveFeatureValidator,
  rejectFeatureValidator,
  getFeaturesQueryValidator,
} from "@modules/features/infrastructure/validators/FeatureValidators";

import { ApprovalWorkflowController } from "../controllers/ApprovalWorkflowController";
import {
  initializeWorkflowValidator,
  approveGateValidator,
  rejectGateValidator,
  requestChangesValidator,
  addCommentValidator,
  assignGateValidator,
} from "@modules/features/infrastructure/validators/ApprovalWorkflowValidators";

// Add these routes after the existing feature routes:
const approvalController = new ApprovalWorkflowController();

const router = Router();
const featureController = new FeatureController();

// All feature routes require authentication
router.use(authenticate);

// Feature CRUD
router.get(
  "/",
  getFeaturesQueryValidator,
  validateRequest,
  featureController.getFeatures
);

router.get("/:id", featureController.getFeatureById);

router.post(
  "/",
  // createFeatureValidator,
  // validateRequest,
  featureController.createFeature
);

router.patch(
  "/:id",
  updateFeatureValidator,
  validateRequest,
  featureController.updateFeature
);

router.delete("/:id", featureController.deleteFeature);

// Feature status
router.patch(
  "/:id/status",
  updateFeatureStatusValidator,
  validateRequest,
  featureController.updateFeatureStatus
);

// Feature voting
router.post("/:id/vote", featureController.voteFeature);
router.delete("/:id/vote", featureController.unvoteFeature);

// Sprint assignment
router.post(
  "/:id/assign-sprint",
  assignSprintValidator,
  validateRequest,
  featureController.assignSprint
);
router.delete("/:id/assign-sprint", featureController.unassignSprint);

// Feature approval
router.post(
  "/:id/approve",
  approveFeatureValidator,
  validateRequest,
  featureController.approveFeature
);
router.post(
  "/:id/reject",
  rejectFeatureValidator,
  validateRequest,
  featureController.rejectFeature
);

// Feature tasks and comments
router.get("/:id/tasks", featureController.getFeatureTasks);
router.get("/:id/comments", featureController.getFeatureComments);
router.post("/:id/comments", featureController.addFeatureComment);

// Approval workflow routes
// Feature tasks and comments
router.get("/:id/tasks", featureController.getFeatureTasks);
router.get("/:id/comments", featureController.getFeatureComments);
router.post("/:id/comments", featureController.addFeatureComment);

//Approval workflow routes
router.post(
  "/:featureId/approval-workflow",
  // Remove validator or make it truly optional
  approvalController.initializeWorkflow
);

router.get("/:featureId/approval-workflow", approvalController.getWorkflow);

router.post(
  "/:featureId/approval-workflow/approve",
  approveGateValidator,
  validateRequest,
  approvalController.approveGate
);

router.post(
  "/:featureId/approval-workflow/reject",
  rejectGateValidator,
  validateRequest,
  approvalController.rejectGate
);

router.post(
  "/:featureId/approval-workflow/request-changes",
  requestChangesValidator,
  validateRequest,
  approvalController.requestChanges
);

router.post(
  "/:featureId/approval-workflow/comments",
  addCommentValidator,
  validateRequest,
  approvalController.addComment
);

router.post(
  "/:featureId/approval-workflow/assign",
  assignGateValidator,
  validateRequest,
  approvalController.assignGate
);

export default router;
