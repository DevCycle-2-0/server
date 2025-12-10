import { body, query } from "express-validator";

const validPlatforms = ["web", "android", "ios", "api", "desktop"];

export const validStatuses = ["active", "inactive", "archived"];

export const createProductValidator = [
  // Name
  body("name")
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),

  // Description (optional)
  body("description")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters")
    .trim(),

  // Platform (single string)
  body("platform")
    .isString()
    .withMessage("Platform is required")
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),

  // Version (semantic version OR simple string)
  body("version")
    .isString()
    .withMessage("Version is required")
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Version must follow semantic format: x.y.z (example: 1.0.0)"),

  // Status
  body("status")
    .isString()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),

  // Team Members Array
  body("teamMembers")
    .optional()
    .isArray()
    .withMessage("Team members must be an array"),
];

export const updateProductValidator = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters")
    .trim(),
  body("platforms")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one platform is required")
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every((p) => validPlatforms.includes(p));
    })
    .withMessage(`Platforms must be one of: ${validPlatforms.join(", ")}`),
];

export const getProductsQueryValidator = [
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
    .isIn(["active", "archived"])
    .withMessage("Status must be either 'active' or 'archived'"),
  query("platform")
    .optional()
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
  query("search").optional().isString().trim(),
  query("sortBy")
    .optional()
    .isIn(["name", "createdAt", "updatedAt"])
    .withMessage("Sort by must be one of: name, createdAt, updatedAt"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];
