// src/modules/dashboard/infrastructure/validators/DashboardValidators.ts

import { query } from "express-validator";

export const getActivityQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("type")
    .optional()
    .isIn(["task", "bug", "feature", "sprint", "release"])
    .withMessage("Type must be one of: task, bug, feature, sprint, release"),
];
