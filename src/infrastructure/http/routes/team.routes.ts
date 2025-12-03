import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const teamController = new TeamController();

router.use(authenticate);

router.get('/', teamController.list);
router.get('/workload', teamController.getWorkload);
router.get('/:id', teamController.get);
router.patch('/:userId/availability', teamController.updateAvailability);
router.patch('/:userId/skills', teamController.updateSkills);

export default router;
