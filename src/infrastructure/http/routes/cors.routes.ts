// src/infrastructure/http/routes/cors.routes.ts
import { Router } from "express";
import { CorsController } from "@infrastructure/http/controllers/CorsController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { body } from "express-validator";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";

const router = Router();
const corsController = new CorsController();

// Validators
const updateOriginsValidator = [
  body("origins")
    .isArray({ min: 1 })
    .withMessage("Origins must be a non-empty array"),
  body("origins.*").isString().withMessage("Each origin must be a string"),
];

const addOriginValidator = [
  body("origin")
    .isString()
    .notEmpty()
    .withMessage("Origin must be a non-empty string"),
];

// All CORS management routes require authentication
// In production, you should add admin-only authorization
router.use(authenticate);

// Get current CORS configuration
router.get("/", corsController.getConfig);

// Enable CORS
router.post("/enable", corsController.enable);

// Disable CORS
router.post("/disable", corsController.disable);

// Update CORS origins
router.put(
  "/origins",
  updateOriginsValidator,
  validateRequest,
  corsController.updateOrigins
);

// Add a CORS origin
router.post(
  "/origins",
  addOriginValidator,
  validateRequest,
  corsController.addOrigin
);

// Remove a CORS origin
router.delete("/origins/:origin", corsController.removeOrigin);

// Reset CORS configuration
router.post("/reset", corsController.reset);

export default router;
