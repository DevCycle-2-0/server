import { Router } from "express";
import { ReleaseController } from "../controllers/ReleaseController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validator";
import {
  createReleaseSchema,
  updateReleaseSchema,
  publishReleaseSchema,
} from "@application/validators/ReleaseValidator";

const router = Router();
const releaseController = new ReleaseController();

router.use(authenticate);

router.get("/:workspaceId/releases", releaseController.list);
router.post(
  "/:workspaceId/releases",
  validate(createReleaseSchema),
  releaseController.create
);
router.get("/:workspaceId/releases/:id", releaseController.getById);
router.patch(
  "/:workspaceId/releases/:id",
  validate(updateReleaseSchema),
  releaseController.update
);
router.delete("/:workspaceId/releases/:id", releaseController.delete);
router.post(
  "/:workspaceId/releases/:id/publish",
  validate(publishReleaseSchema),
  releaseController.publish
);
router.post("/:workspaceId/releases/:id/rollback", releaseController.rollback);

export default router;
