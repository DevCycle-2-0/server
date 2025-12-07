import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();
const commentController = new CommentController();

router.use(authenticate);

router.get(
  "/:workspaceId/:entityType/:entityId/comments",
  commentController.list
);
router.post(
  "/:workspaceId/:entityType/:entityId/comments",
  commentController.create
);

export default router;
