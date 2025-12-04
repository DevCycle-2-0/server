import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const onboardingController = new OnboardingController();

router.use(authenticate);

router.get('/me/onboarding', onboardingController.getStatus);
router.patch('/me/onboarding', onboardingController.updateProgress);
router.post('/me/onboarding/complete', onboardingController.complete);
router.post('/me/onboarding/skip', onboardingController.skip);

export default router;
