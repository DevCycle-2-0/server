import { Router } from 'express';
import { AuthControllerComplete } from '../controllers/AuthController';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthControllerComplete();

// Public routes
router.post('/signup', validate(registerSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/verify-email', authController.verifyEmail);
router.post('/password/reset-request', authController.requestPasswordReset);
router.post('/password/reset', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateProfile);
router.get('/me/roles', authenticate, authController.getRoles);
router.post('/resend-verification', authenticate, authController.resendVerification);
router.post('/password/change', authenticate, authController.changePassword);

export default router;
