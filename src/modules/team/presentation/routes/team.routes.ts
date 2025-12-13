import { Router } from "express";
import { TeamController } from "../controllers/TeamController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { checkRole } from "@modules/auth/presentation/middlewares/checkRole";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  inviteTeamMemberValidator,
  updateTeamMemberValidator,
} from "@modules/team/infrastructure/validators/TeamValidators";

const router = Router();
const teamController = new TeamController();

// All routes require authentication
router.use(authenticate);

// Read access for all authenticated users
router.get("/", teamController.getTeamMembers);
router.get("/:id", teamController.getTeamMemberById);
router.get("/workload", teamController.getWorkloadDistribution);

// Invite: Admin only
router.post(
  "/invite",
  checkRole("admin"),
  inviteTeamMemberValidator,
  validateRequest,
  teamController.inviteTeamMember
);

// Remove: Admin only
router.delete("/:id", checkRole("admin"), teamController.deleteTeamMember);

// Update: Admin + Moderator
router.patch(
  "/:id",
  checkRole("admin", "moderator"),
  updateTeamMemberValidator,
  validateRequest,
  teamController.updateTeamMember
);

export default router;
