import { body, query } from "express-validator";

const validPlatforms = ["web", "android", "ios", "api", "desktop"];
const validPriorities = ["low", "medium", "high", "critical"];
const validStatuses = [
  "idea",
  "review",
  "approved",
  "planning",
  "design",
  "development",
  "testing",
  "release",
  "live",
  "rejected",
];

export const createFeatureValidator = [
  body("title")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .trim(),
  body("description")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .trim(),
  body("priority")
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  body("productId").isUUID().withMessage("Product ID must be a valid UUID"),
  body("platform")
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
];

export const updateFeatureValidator = [
  body("title")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .trim(),
  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  body("estimatedHours")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Estimated hours must be a positive integer"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const updateFeatureStatusValidator = [
  body("status")
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),
];

export const assignSprintValidator = [
  body("sprintId").isUUID().withMessage("Sprint ID must be a valid UUID"),
];

export const approveFeatureValidator = [
  body("comment").optional().isString().withMessage("Comment must be a string"),
];

export const rejectFeatureValidator = [
  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .isString()
    .withMessage("Reason must be a string"),
];

export const getFeaturesQueryValidator = [
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
  query("sprintId")
    .optional()
    .isUUID()
    .withMessage("Sprint ID must be a valid UUID"),
  query("search").optional().isString().trim(),
  query("sortBy").optional().isString().withMessage("Sort by must be a string"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];
