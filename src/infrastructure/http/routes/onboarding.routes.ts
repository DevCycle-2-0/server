import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateOnboardingSchema } from '../validators/onboarding.validator';

const router = Router();
const onboardingController = new OnboardingController();

router.use(authenticate);

router.get('/me/onboarding', onboardingController.getStatus);
router.patch(
  '/me/onboarding',
  validate(updateOnboardingSchema),
  onboardingController.updateProgress
);
router.post('/me/onboarding/complete', onboardingController.complete);
router.post('/me/onboarding/skip', onboardingController.skip);

export default router;
