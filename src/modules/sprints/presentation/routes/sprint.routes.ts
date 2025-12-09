// src/modules/sprints/presentation/routes/sprint.routes.ts
import { Router } from "express";
import { SprintController } from "../controllers/SprintController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createSprintValidator,
  updateSprintValidator,
  addTaskToSprintValidator,
  addBugToSprintValidator,
  saveRetrospectiveValidator,
  getSprintsQueryValidator,
} from "@modules/sprints/infrastructure/validators/SprintValidators";

const router = Router();
const sprintController = new SprintController();

// All sprint routes require authentication
router.use(authenticate);

// Sprint CRUD
router.get(
  "/",
  getSprintsQueryValidator,
  validateRequest,
  sprintController.getSprints
);

router.get("/:id", sprintController.getSprintById);

router.post(
  "/",
  createSprintValidator,
  validateRequest,
  sprintController.createSprint
);

router.patch(
  "/:id",
  updateSprintValidator,
  validateRequest,
  sprintController.updateSprint
);

router.delete("/:id", sprintController.deleteSprint);

// Sprint actions
router.post("/:id/start", sprintController.startSprint);
router.post("/:id/complete", sprintController.completeSprint);

// Sprint tasks
router.get("/:id/tasks", sprintController.getSprintTasks);
router.post(
  "/:id/tasks",
  addTaskToSprintValidator,
  validateRequest,
  sprintController.addTaskToSprint
);
router.delete("/:id/tasks/:taskId", sprintController.removeTaskFromSprint);

// Sprint bugs
router.get("/:id/bugs", sprintController.getSprintBugs);
router.post(
  "/:id/bugs",
  addBugToSprintValidator,
  validateRequest,
  sprintController.addBugToSprint
);
router.delete("/:id/bugs/:bugId", sprintController.removeBugFromSprint);

// Sprint metrics and retrospective
router.get("/:id/metrics", sprintController.getSprintMetrics);
router.get("/:id/retrospective", sprintController.getRetrospective);
router.post(
  "/:id/retrospective",
  saveRetrospectiveValidator,
  validateRequest,
  sprintController.saveRetrospective
);

export default router;
