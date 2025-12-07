import { Router } from "express";
import { SprintController } from "../controllers/SprintController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validator";
import {
  createSprintSchema,
  updateSprintSchema,
} from "@application/validators/SprintValidator";

const router = Router();
const sprintController = new SprintController();

router.use(authenticate);

router.get("/:workspaceId/sprints", sprintController.list);
router.post(
  "/:workspaceId/sprints",
  validate(createSprintSchema),
  sprintController.create
);
router.get("/:workspaceId/sprints/:id", sprintController.getById);
router.patch(
  "/:workspaceId/sprints/:id",
  validate(updateSprintSchema),
  sprintController.update
);
router.delete("/:workspaceId/sprints/:id", sprintController.delete);
router.post("/:workspaceId/sprints/:id/start", sprintController.start);
router.post("/:workspaceId/sprints/:id/complete", sprintController.complete);

export default router;
