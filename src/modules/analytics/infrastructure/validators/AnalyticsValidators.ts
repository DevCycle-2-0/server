// src/modules/analytics/infrastructure/validators/AnalyticsValidators.ts

import { body, query } from "express-validator";

export const getOverviewQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const getVelocityQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

export const getBugResolutionQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
];

export const getFeatureCompletionQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const getReleaseFrequencyQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const getTimeTrackingQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  query("userId")
    .optional()
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];

export const getTeamPerformanceQueryValidator = [
  query("userId")
    .optional()
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const exportAnalyticsValidator = [
  body("type")
    .isIn(["velocity", "burndown", "bugs", "features", "time", "team"])
    .withMessage(
      "Type must be one of: velocity, burndown, bugs, features, time, team"
    ),
  body("format")
    .isIn(["csv", "xlsx", "pdf"])
    .withMessage("Format must be one of: csv, xlsx, pdf"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  body("filters")
    .optional()
    .isObject()
    .withMessage("Filters must be an object"),
];
