import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validator";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@application/validators/TaskValidator";

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.get("/:workspaceId/tasks", taskController.list);
router.post(
  "/:workspaceId/tasks",
  validate(createTaskSchema),
  taskController.create
);
router.get("/:workspaceId/tasks/:id", taskController.getById);
router.patch(
  "/:workspaceId/tasks/:id",
  validate(updateTaskSchema),
  taskController.update
);
router.delete("/:workspaceId/tasks/:id", taskController.delete);
router.patch(
  "/:workspaceId/tasks/:id/status",
  validate(updateTaskStatusSchema),
  taskController.updateStatus
);

export default router;
