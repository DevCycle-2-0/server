import { body, query } from "express-validator";

const validPlatforms = ["web", "android", "ios", "api", "desktop"];
const validStatuses = [
  "planning",
  "in_development",
  "testing",
  "staged",
  "released",
  "rolled_back",
];
const validPipelineStages = [
  "build",
  "unit_tests",
  "integration_tests",
  "security_scan",
  "staging_deploy",
  "production_deploy",
];

export const createReleaseValidator = [
  body("version")
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Version must be in semver format (x.y.z)"),
  body("buildId")
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage("Build ID must be alphanumeric with dashes"),
  body("productId").isUUID().withMessage("Product ID must be a valid UUID"),
  body("platform")
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
  body("plannedDate")
    .optional()
    .isISO8601()
    .withMessage("Planned date must be a valid ISO 8601 date"),
  body("releaseNotes")
    .optional()
    .isString()
    .withMessage("Release notes must be a string"),
];

export const updateReleaseValidator = [
  body("version")
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Version must be in semver format (x.y.z)"),
  body("buildId")
    .optional()
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage("Build ID must be alphanumeric with dashes"),
  body("plannedDate")
    .optional()
    .isISO8601()
    .withMessage("Planned date must be a valid ISO 8601 date"),
  body("releaseNotes")
    .optional()
    .isString()
    .withMessage("Release notes must be a string"),
];

export const updateReleaseStatusValidator = [
  body("status")
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),
];

export const completePipelineStageValidator = [
  body("success").isBoolean().withMessage("Success must be a boolean"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .trim(),
];

export const deployReleaseValidator = [
  body("environment")
    .isIn(["staging", "production"])
    .withMessage("Environment must be either 'staging' or 'production'"),
];

export const rollbackReleaseValidator = [
  body("reason").notEmpty().withMessage("Reason is required").isString().trim(),
  body("targetVersion")
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage("Target version must be in semver format (x.y.z)"),
];

export const updateReleaseNotesValidator = [
  body("notes").notEmpty().withMessage("Notes are required").isString().trim(),
];

export const linkFeatureValidator = [
  body("featureId").isUUID().withMessage("Feature ID must be a valid UUID"),
];

export const linkBugValidator = [
  body("bugId").isUUID().withMessage("Bug ID must be a valid UUID"),
];

export const requestApprovalValidator = [
  body("approvers")
    .isArray({ min: 1 })
    .withMessage("Approvers must be an array with at least one item"),
  body("approvers.*")
    .isUUID()
    .withMessage("Each approver must be a valid UUID"),
];

export const approveReleaseValidator = [
  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .trim(),
];

export const rejectReleaseValidator = [
  body("reason").notEmpty().withMessage("Reason is required").isString().trim(),
];

export const getReleasesQueryValidator = [
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
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),
  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
  query("platform")
    .optional()
    .isIn(validPlatforms)
    .withMessage(`Platform must be one of: ${validPlatforms.join(", ")}`),
];

export const exportNotesQueryValidator = [
  query("format")
    .isIn(["markdown", "html", "pdf"])
    .withMessage("Format must be one of: markdown, html, pdf"),
];
