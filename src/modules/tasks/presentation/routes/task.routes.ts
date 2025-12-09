// src/modules/tasks/presentation/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  assignTaskValidator,
  createTimeLogValidator,
  createSubtaskValidator,
  updateSubtaskValidator,
  createCommentValidator,
  updateCommentValidator,
  createDependencyValidator,
  getTasksQueryValidator,
} from "@modules/tasks/infrastructure/validators/TaskValidators";

const router = Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authenticate);

// Task CRUD
router.get(
  "/",
  getTasksQueryValidator,
  validateRequest,
  taskController.getTasks
);

router.get("/:id", taskController.getTaskById);

router.post(
  "/",
  createTaskValidator,
  validateRequest,
  taskController.createTask
);

router.patch(
  "/:id",
  updateTaskValidator,
  validateRequest,
  taskController.updateTask
);

router.delete("/:id", taskController.deleteTask);

// Task status
router.patch(
  "/:id/status",
  updateTaskStatusValidator,
  validateRequest,
  taskController.updateTaskStatus
);

// Task assignment
router.post(
  "/:id/assign",
  assignTaskValidator,
  validateRequest,
  taskController.assignTask
);

router.delete("/:id/assign", taskController.unassignTask);

// Time logging
router.post(
  "/:id/time-logs",
  createTimeLogValidator,
  validateRequest,
  taskController.logTime
);

router.get("/:id/time-logs", taskController.getTimeLogs);

// Subtasks
router.post(
  "/:id/subtasks",
  createSubtaskValidator,
  validateRequest,
  taskController.addSubtask
);

router.patch(
  "/:id/subtasks/:subtaskId",
  updateSubtaskValidator,
  validateRequest,
  taskController.updateSubtask
);

router.delete("/:id/subtasks/:subtaskId", taskController.deleteSubtask);

router.post("/:id/subtasks/:subtaskId/toggle", taskController.toggleSubtask);

// Comments
router.get("/:id/comments", taskController.getComments);

router.post(
  "/:id/comments",
  createCommentValidator,
  validateRequest,
  taskController.addComment
);

router.patch(
  "/:id/comments/:commentId",
  updateCommentValidator,
  validateRequest,
  taskController.updateComment
);

router.delete("/:id/comments/:commentId", taskController.deleteComment);

// Dependencies
router.post(
  "/:id/dependencies",
  createDependencyValidator,
  validateRequest,
  taskController.addDependency
);

router.delete(
  "/:id/dependencies/:dependencyTaskId",
  taskController.removeDependency
);

// Attachments
router.post("/:id/attachments", taskController.uploadAttachment);
router.delete(
  "/:id/attachments/:attachmentId",
  taskController.deleteAttachment
);

export default router;
