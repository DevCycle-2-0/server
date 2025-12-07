import { Router } from "express";
import { BugController } from "../controllers/BugController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validator";
import {
  createBugSchema,
  updateBugSchema,
  resolveBugSchema,
} from "@application/validators/BugValidator";

const router = Router();
const bugController = new BugController();

router.use(authenticate);

router.get("/:workspaceId/bugs", bugController.list);
router.post(
  "/:workspaceId/bugs",
  validate(createBugSchema),
  bugController.create
);
router.get("/:workspaceId/bugs/:id", bugController.getById);
router.patch(
  "/:workspaceId/bugs/:id",
  validate(updateBugSchema),
  bugController.update
);
router.delete("/:workspaceId/bugs/:id", bugController.delete);
router.post(
  "/:workspaceId/bugs/:id/resolve",
  validate(resolveBugSchema),
  bugController.resolve
);

export default router;
