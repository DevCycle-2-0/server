// src/modules/team/presentation/routes/team.routes.ts
import { Router } from "express";
import { TeamController } from "../controllers/TeamController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  inviteTeamMemberValidator,
  updateTeamMemberValidator,
  assignRoleValidator,
  updateAvailabilityValidator,
  updateSkillsValidator,
  createTimeOffValidator,
  searchMembersQueryValidator,
  getCalendarQueryValidator,
} from "@modules/team/infrastructure/validators/TeamValidators";

const router = Router();
const teamController = new TeamController();

// All team routes require authentication
router.use(authenticate);

// Team members
router.get("/", teamController.getTeamMembers);
router.get(
  "/search",
  searchMembersQueryValidator,
  validateRequest,
  teamController.searchMembers
);
router.get("/workload", teamController.getWorkloadDistribution);
router.get(
  "/calendar",
  getCalendarQueryValidator,
  validateRequest,
  teamController.getTeamCalendar
);
router.get("/timeoff", teamController.getTimeOffRequests);

// Invitations
router.get("/invites", teamController.getPendingInvitations);
router.post(
  "/invite",
  inviteTeamMemberValidator,
  validateRequest,
  teamController.inviteTeamMember
);
router.post("/invites/:id/resend", teamController.resendInvitation);
router.delete("/invites/:id", teamController.cancelInvitation);

// Individual member operations
router.get("/:id", teamController.getTeamMemberById);
router.patch(
  "/:id",
  updateTeamMemberValidator,
  validateRequest,
  teamController.updateTeamMember
);
router.delete("/:id", teamController.deleteTeamMember);

// Member roles
router.get("/:id/roles", teamController.getMemberRoles);
router.post(
  "/:id/roles",
  assignRoleValidator,
  validateRequest,
  teamController.assignRole
);
router.delete("/:id/roles/:role", teamController.removeRole);

// Member availability
router.patch(
  "/:id/availability",
  updateAvailabilityValidator,
  validateRequest,
  teamController.updateAvailability
);

// Member tasks and bugs
router.get("/:id/tasks", teamController.getMemberTasks);
router.get("/:id/bugs", teamController.getMemberBugs);

// Member skills
router.patch(
  "/:id/skills",
  updateSkillsValidator,
  validateRequest,
  teamController.updateSkills
);

// Time off
router.post(
  "/:id/timeoff",
  createTimeOffValidator,
  validateRequest,
  teamController.requestTimeOff
);

export default router;
