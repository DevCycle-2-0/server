// src/modules/auth/presentation/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares/authenticate";
import { validateRequest } from "../middlewares/validateRequest";
import {
  loginValidator,
  signupValidator,
  updateProfileValidator,
  changePasswordValidator,
} from "@modules/auth/infrastructure/validators/AuthValidators";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/login", loginValidator, validateRequest, authController.login);
router.post("/signup", signupValidator, validateRequest, authController.signup);
router.post("/refresh", authController.refreshToken);
router.post("/password/reset-request", authController.requestPasswordReset);
router.post("/password/reset", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser); // Returns role + permissions
router.get("/me/roles", authenticate, authController.getUserRoles); // NEW: Returns detailed role info
router.patch(
  "/me",
  authenticate,
  updateProfileValidator,
  validateRequest,
  authController.updateProfile
);
router.post(
  "/password/change",
  authenticate,
  changePasswordValidator,
  validateRequest,
  authController.changePassword
);
router.post(
  "/resend-verification",
  authenticate,
  authController.resendVerification
);

export default router;
