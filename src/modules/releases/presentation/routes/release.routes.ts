// src/modules/releases/presentation/routes/release.routes.ts
import { Router } from "express";
import { ReleaseController } from "../controllers/ReleaseController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createReleaseValidator,
  updateReleaseValidator,
  updateReleaseStatusValidator,
  completePipelineStageValidator,
  deployReleaseValidator,
  rollbackReleaseValidator,
  updateReleaseNotesValidator,
  linkFeatureValidator,
  linkBugValidator,
  requestApprovalValidator,
  approveReleaseValidator,
  rejectReleaseValidator,
  getReleasesQueryValidator,
  exportNotesQueryValidator,
} from "@modules/releases/infrastructure/validators/ReleaseValidators";

const router = Router();
const releaseController = new ReleaseController();

// All release routes require authentication
router.use(authenticate);

// Release CRUD
router.get(
  "/",
  getReleasesQueryValidator,
  validateRequest,
  releaseController.getReleases
);

router.get("/:id", releaseController.getReleaseById);

router.post(
  "/",
  createReleaseValidator,
  validateRequest,
  releaseController.createRelease
);

router.patch(
  "/:id",
  updateReleaseValidator,
  validateRequest,
  releaseController.updateRelease
);

router.delete("/:id", releaseController.deleteRelease);

// Release status
router.patch(
  "/:id/status",
  updateReleaseStatusValidator,
  validateRequest,
  releaseController.updateReleaseStatus
);

// Pipeline operations
router.get("/:id/pipeline", releaseController.getPipeline);

router.post("/:id/pipeline/:stage/start", releaseController.startPipelineStage);

router.post(
  "/:id/pipeline/:stage/complete",
  completePipelineStageValidator,
  validateRequest,
  releaseController.completePipelineStage
);

router.post("/:id/pipeline/:stage/retry", releaseController.retryPipelineStage);

// Deploy and rollback
router.post(
  "/:id/deploy",
  deployReleaseValidator,
  validateRequest,
  releaseController.deployRelease
);

router.post(
  "/:id/rollback",
  rollbackReleaseValidator,
  validateRequest,
  releaseController.rollbackRelease
);

router.get("/:id/rollbacks", releaseController.getRollbacks);

// Release notes
router.patch(
  "/:id/notes",
  updateReleaseNotesValidator,
  validateRequest,
  releaseController.updateReleaseNotes
);

router.post("/:id/notes/generate", releaseController.generateReleaseNotes);

router.get(
  "/:id/notes/export",
  exportNotesQueryValidator,
  validateRequest,
  releaseController.exportReleaseNotes
);

// Feature linking
router.post(
  "/:id/features",
  linkFeatureValidator,
  validateRequest,
  releaseController.linkFeature
);

router.delete("/:id/features/:featureId", releaseController.unlinkFeature);

// Bug linking
router.post(
  "/:id/bugs",
  linkBugValidator,
  validateRequest,
  releaseController.linkBug
);

router.delete("/:id/bugs/:bugId", releaseController.unlinkBug);

// Approval workflow
router.post(
  "/:id/approval/request",
  requestApprovalValidator,
  validateRequest,
  releaseController.requestApproval
);

router.post(
  "/:id/approval/approve",
  approveReleaseValidator,
  validateRequest,
  releaseController.approveRelease
);

router.post(
  "/:id/approval/reject",
  rejectReleaseValidator,
  validateRequest,
  releaseController.rejectRelease
);

router.get("/:id/approval", releaseController.getApprovalStatus);

export default router;
