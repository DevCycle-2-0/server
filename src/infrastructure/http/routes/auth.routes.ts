import { Router } from 'express';
import { AuthControllerComplete } from '../controllers/AuthController';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  authRateLimit,
  passwordResetRateLimit,
  emailVerificationRateLimit,
} from '../middleware/rate-limit.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthControllerComplete();

// Public routes with rate limiting
router.post('/signup', authRateLimit, validate(registerSchema), authController.signup);
router.post('/login', authRateLimit, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/verify-email', authController.verifyEmail);
router.post('/password/reset-request', passwordResetRateLimit, authController.requestPasswordReset);
router.post('/password/reset', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateProfile);
router.get('/me/roles', authenticate, authController.getRoles);
router.post(
  '/resend-verification',
  authenticate,
  emailVerificationRateLimit,
  authController.resendVerification
);
router.post('/password/change', authenticate, authController.changePassword);

export default router;
