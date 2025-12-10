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

  // Description
  body("description")
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters")
    .trim(),

  // Support both singular 'platform' and plural 'platforms'
  body().custom((value) => {
    // Must have either platform or platforms
    if (!value.platform && !value.platforms) {
      throw new Error("Either 'platform' or 'platforms' is required");
    }

    // If platform (singular), validate it's a valid platform
    if (value.platform) {
      if (typeof value.platform !== "string") {
        throw new Error("Platform must be a string");
      }
      if (!validPlatforms.includes(value.platform)) {
        throw new Error(
          `Platform must be one of: ${validPlatforms.join(", ")}`
        );
      }
    }

    // If platforms (plural), validate it's an array of valid platforms
    if (value.platforms) {
      if (!Array.isArray(value.platforms)) {
        throw new Error("Platforms must be an array");
      }
      if (value.platforms.length === 0) {
        throw new Error("At least one platform is required");
      }
      const invalid = value.platforms.filter(
        (p: any) => !validPlatforms.includes(p)
      );
      if (invalid.length > 0) {
        throw new Error(
          `Invalid platforms: ${invalid.join(
            ", "
          )}. Must be one of: ${validPlatforms.join(", ")}`
        );
      }
    }

    return true;
  }),
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
