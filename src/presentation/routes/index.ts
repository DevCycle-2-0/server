import { Router } from "express";
import authRoutes from "./authRoutes";
import workspaceRoutes from "./workspaceRoutes";
import productRoutes from "./productRoutes";
import featureRoutes from "./featureRoutes";
import sprintRoutes from "./sprintRoutes";
import taskRoutes from "./taskRoutes";
import bugRoutes from "./bugRoutes";
import releaseRoutes from "./releaseRoutes";

const router = Router();

// Authentication
router.use("/auth", authRoutes);

// Workspaces
router.use("/workspaces", workspaceRoutes);

// All workspace-scoped resources
router.use("/workspaces", productRoutes);
router.use("/workspaces", featureRoutes);
router.use("/workspaces", sprintRoutes);
router.use("/workspaces", taskRoutes);
router.use("/workspaces", bugRoutes);
router.use("/workspaces", releaseRoutes);

export default router;
