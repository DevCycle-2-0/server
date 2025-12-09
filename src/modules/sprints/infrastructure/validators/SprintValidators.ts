import { body, query } from "express-validator";

const validStatuses = ["planning", "active", "completed", "cancelled"];

export const createSprintValidator = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("goal")
    .isLength({ min: 10, max: 500 })
    .withMessage("Goal must be between 10 and 500 characters")
    .trim(),
  body("productId").isUUID().withMessage("Product ID must be a valid UUID"),
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("capacity")
    .isFloat({ min: 0 })
    .withMessage("Capacity must be a positive number"),
];

export const updateSprintValidator = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("goal")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Goal must be between 10 and 500 characters")
    .trim(),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (
        req.body.startDate &&
        new Date(value) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("capacity")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Capacity must be a positive number"),
];

export const addTaskToSprintValidator = [
  body("taskId").isUUID().withMessage("Task ID must be a valid UUID"),
];

export const addBugToSprintValidator = [
  body("bugId").isUUID().withMessage("Bug ID must be a valid UUID"),
];

export const saveRetrospectiveValidator = [
  body("wentWell")
    .isArray({ min: 1 })
    .withMessage("Went well must be an array with at least one item"),
  body("wentWell.*").isString().trim(),
  body("needsImprovement")
    .isArray({ min: 1 })
    .withMessage("Needs improvement must be an array with at least one item"),
  body("needsImprovement.*").isString().trim(),
  body("actionItems")
    .isArray({ min: 1 })
    .withMessage("Action items must be an array with at least one item"),
  body("actionItems.*").isString().trim(),
];

export const getSprintsQueryValidator = [
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
  query("productId")
    .optional()
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
];
