import { Router } from "express";
import { BugController } from "../controllers/BugController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createBugValidator,
  updateBugValidator,
  updateBugStatusValidator,
  assignBugValidator,
  linkFeatureValidator,
  addToSprintValidator,
  addRetestResultValidator,
  getBugsQueryValidator,
  getBugStatisticsQueryValidator,
} from "@modules/bugs/infrastructure/validators/BugValidators";

const router = Router();
const bugController = new BugController();

// All bug routes require authentication
router.use(authenticate);

// Bug statistics
router.get(
  "/statistics",
  getBugStatisticsQueryValidator,
  validateRequest,
  bugController.getBugStatistics
);

// Bug CRUD
router.get("/", getBugsQueryValidator, validateRequest, bugController.getBugs);

router.get("/:id", bugController.getBugById);

router.post("/", createBugValidator, validateRequest, bugController.createBug);

router.patch(
  "/:id",
  updateBugValidator,
  validateRequest,
  bugController.updateBug
);

router.delete("/:id", bugController.deleteBug);

// Bug status
router.patch(
  "/:id/status",
  updateBugStatusValidator,
  validateRequest,
  bugController.updateBugStatus
);

// Bug assignment
router.post(
  "/:id/assign",
  assignBugValidator,
  validateRequest,
  bugController.assignBug
);

router.delete("/:id/assign", bugController.unassignBug);

// Feature linking
router.post(
  "/:id/link-feature",
  linkFeatureValidator,
  validateRequest,
  bugController.linkFeature
);

router.delete("/:id/link-feature", bugController.unlinkFeature);

// Sprint assignment
router.post(
  "/:id/add-to-sprint",
  addToSprintValidator,
  validateRequest,
  bugController.addToSprint
);

router.delete("/:id/remove-from-sprint", bugController.removeFromSprint);

// Retest results
router.post(
  "/:id/retest",
  addRetestResultValidator,
  validateRequest,
  bugController.addRetestResult
);

router.get("/:id/retest", bugController.getRetestHistory);

export default router;
