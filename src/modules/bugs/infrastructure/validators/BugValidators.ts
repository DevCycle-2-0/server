// src/modules/bugs/infrastructure/validators/BugValidators.ts
import { body, query } from "express-validator";

const validPlatforms = ["web", "android", "ios", "api", "desktop"];
const validPriorities = ["low", "medium", "high", "critical"];
const validSeverities = ["low", "medium", "high", "critical"];
const validStatuses = [
  "new",
  "confirmed",
  "in_progress",
  "fixed",
  "verified",
  "closed",
  "reopened",
  "wont_fix",
  "duplicate",
];

export const createBugValidator = [
  body("title")
    .isLength({ min: 10, max: 200 })
    .withMessage("Title must be between 10 and 200 characters")
    .trim(),
  body("description")
    .isLength({ min: 20, max: 5000 })
    .withMessage("Description must be between 20 and 5000 characters")
    .trim(),
  body("stepsToReproduce")
    .custom((value) => {
      // Accept both string and array formats
      if (typeof value === "string") {
        return value.trim().length >= 10;
      }
      if (Array.isArray(value)) {
        // Will be converted to string in the controller/use case
        return value.length > 0;
      }
      return false;
    })
    .withMessage(
      "Steps to reproduce must be provided (minimum 10 characters or at least 1 step)"
    ),
  body("expectedBehavior")
    .custom((value) => {
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    })
    .withMessage("Expected behavior is required"),
  body("actualBehavior")
    .custom((value) => {
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    })
    .withMessage("Actual behavior is required"),
  body("severity")
    .isIn(validSeverities)
    .withMessage(`Severity must be one of: ${validSeverities.join(", ")}`),
  body("priority")
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  body("productId").isUUID().withMessage("Product ID must be a valid UUID"),
  body("platform")
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
  body("environment").notEmpty().withMessage("Environment is required").trim(),
  body("version")
    .optional()
    .isString()
    .withMessage("Version must be a string")
    .trim(),
  body("browserInfo")
    .optional()
    .isString()
    .withMessage("Browser info must be a string")
    .trim(),
];

export const updateBugValidator = [
  body("title")
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage("Title must be between 10 and 200 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ min: 20, max: 5000 })
    .withMessage("Description must be between 20 and 5000 characters")
    .trim(),
  body("stepsToReproduce")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        return value.trim().length >= 10;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    })
    .withMessage(
      "Steps to reproduce must be at least 10 characters or at least 1 step"
    ),
  body("expectedBehavior")
    .optional()
    .custom((value) => {
      if (!value) return true; // optional
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    }),
  body("actualBehavior")
    .optional()
    .custom((value) => {
      if (!value) return true; // optional
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    }),
  body("severity")
    .optional()
    .isIn(validSeverities)
    .withMessage(`Severity must be one of: ${validSeverities.join(", ")}`),
  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
];

export const updateBugStatusValidator = [
  body("status")
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),
];

export const assignBugValidator = [
  body("assigneeId").isUUID().withMessage("Assignee ID must be a valid UUID"),
];

export const linkFeatureValidator = [
  body("featureId").isUUID().withMessage("Feature ID must be a valid UUID"),
];

export const addToSprintValidator = [
  body("sprintId").isUUID().withMessage("Sprint ID must be a valid UUID"),
];

export const addRetestResultValidator = [
  body("status")
    .isIn(["passed", "failed"])
    .withMessage("Status must be either 'passed' or 'failed'"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .trim(),
  body("environment").notEmpty().withMessage("Environment is required").trim(),
];

export const getBugsQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isString()
    .withMessage("Status must be a comma-separated string"),
  query("severity")
    .optional()
    .isString()
    .withMessage("Severity must be a comma-separated string"),
  query("priority")
    .optional()
    .isString()
    .withMessage("Priority must be a comma-separated string"),
  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
  query("platform")
    .optional()
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
  query("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Assignee ID must be a valid UUID"),
  query("reporterId")
    .optional()
    .isUUID()
    .withMessage("Reporter ID must be a valid UUID"),
  query("sprintId")
    .optional()
    .isUUID()
    .withMessage("Sprint ID must be a valid UUID"),
  query("search").optional().isString().trim(),
];

export const getBugStatisticsQueryValidator = [
  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Date from must be a valid ISO 8601 date"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Date to must be a valid ISO 8601 date"),
];
