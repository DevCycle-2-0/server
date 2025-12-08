import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validator';
import {
  updateMemberProfileSchema,
  addSkillSchema,
  updateAvailabilitySchema,
} from '@application/validators/TeamValidator';

const router = Router();
const teamController = new TeamController();

router.use(authenticate);

router.get('/:workspaceId/team/members', teamController.listMembers);
router.get('/:workspaceId/team/members/:id', teamController.getMemberProfile);
router.patch(
  '/:workspaceId/team/members/:id',
  validate(updateMemberProfileSchema),
  teamController.updateMemberProfile
);
router.get(
  '/:workspaceId/team/members/:id/workload',
  teamController.getMemberWorkload
);
router.patch(
  '/:workspaceId/team/members/:id/availability',
  validate(updateAvailabilitySchema),
  teamController.updateMemberProfile
);
router.get('/:workspaceId/team/workload', teamController.getTeamWorkload);
router.get('/:workspaceId/team/skills', teamController.listSkills);
router.post(
  '/:workspaceId/team/skills',
  validate(addSkillSchema),
  teamController.addSkill
);

export default router;
