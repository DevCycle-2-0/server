import { body, query } from "express-validator";

const validRoles = [
  "business_owner",
  "product_owner",
  "technical_leader",
  "ui_ux_designer",
  "frontend_dev",
  "backend_dev",
  "mobile_android",
  "mobile_ios",
  "qa_tester",
  "project_manager",
];

const validAvailabilityStatuses = ["available", "busy", "out_of_office"];
const validTimeOffTypes = ["vacation", "sick", "personal", "other"];

export const inviteTeamMemberValidator = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("role")
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(", ")}`),
];

export const updateTeamMemberValidator = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("role")
    .optional()
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(", ")}`),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
];

export const assignRoleValidator = [
  body("role")
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(", ")}`),
];

export const updateAvailabilityValidator = [
  body("availability")
    .isArray({ min: 1 })
    .withMessage("Availability must be an array with at least one item"),
  body("availability.*.date")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),
  body("availability.*.status")
    .isIn(validAvailabilityStatuses)
    .withMessage(
      `Status must be one of: ${validAvailabilityStatuses.join(", ")}`
    ),
  body("availability.*.notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .trim(),
];

export const updateSkillsValidator = [
  body("skills").isArray().withMessage("Skills must be an array"),
  body("skills.*").isString().withMessage("Each skill must be a string").trim(),
];

export const createTimeOffValidator = [
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("type")
    .isIn(validTimeOffTypes)
    .withMessage(`Type must be one of: ${validTimeOffTypes.join(", ")}`),
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string")
    .trim(),
];

export const searchMembersQueryValidator = [
  query("skills")
    .notEmpty()
    .withMessage("Skills parameter is required")
    .isString()
    .withMessage("Skills must be a comma-separated string"),
];

export const getCalendarQueryValidator = [
  query("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];
