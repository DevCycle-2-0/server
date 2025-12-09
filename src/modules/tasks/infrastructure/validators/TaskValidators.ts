import { body, query } from "express-validator";

const validTaskTypes = [
  "frontend",
  "backend",
  "mobile_android",
  "mobile_ios",
  "api",
  "design",
  "qa",
  "devops",
  "documentation",
  "other",
];

const validTaskStatuses = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "testing",
  "done",
  "blocked",
];

const validPriorities = ["low", "medium", "high", "critical"];

export const createTaskValidator = [
  body("title")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must be less than 5000 characters")
    .trim(),
  body("type")
    .isIn(validTaskTypes)
    .withMessage(`Type must be one of: ${validTaskTypes.join(", ")}`),
  body("priority")
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  body("featureId")
    .optional()
    .isUUID()
    .withMessage("Feature ID must be a valid UUID"),
  body("sprintId")
    .optional()
    .isUUID()
    .withMessage("Sprint ID must be a valid UUID"),
  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Assignee ID must be a valid UUID"),
  body("estimatedHours")
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage("Estimated hours must be between 0 and 999"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
  body("labels").optional().isArray().withMessage("Labels must be an array"),
];

export const updateTaskValidator = [
  body("title")
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must be less than 5000 characters")
    .trim(),
  body("type")
    .optional()
    .isIn(validTaskTypes)
    .withMessage(`Type must be one of: ${validTaskTypes.join(", ")}`),
  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  body("estimatedHours")
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage("Estimated hours must be between 0 and 999"),
  body("labels").optional().isArray().withMessage("Labels must be an array"),
];

export const updateTaskStatusValidator = [
  body("status")
    .isIn(validTaskStatuses)
    .withMessage(`Status must be one of: ${validTaskStatuses.join(", ")}`),
];

export const assignTaskValidator = [
  body("assigneeId").isUUID().withMessage("Assignee ID must be a valid UUID"),
];

export const createTimeLogValidator = [
  body("hours")
    .isFloat({ min: 0.1, max: 24 })
    .withMessage("Hours must be between 0.1 and 24"),
  body("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        throw new Error("Date cannot be in the future");
      }
      return true;
    }),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters")
    .trim(),
];

export const createSubtaskValidator = [
  body("title")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters")
    .trim(),
];

export const updateSubtaskValidator = [
  body("title")
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters")
    .trim(),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
];

export const createCommentValidator = [
  body("content")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Content must be between 1 and 5000 characters")
    .trim(),
];

export const updateCommentValidator = [
  body("content")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Content must be between 1 and 5000 characters")
    .trim(),
];

export const createDependencyValidator = [
  body("dependsOnTaskId")
    .isUUID()
    .withMessage("Depends on task ID must be a valid UUID"),
  body("type")
    .isIn(["blocks", "blocked_by"])
    .withMessage("Type must be either 'blocks' or 'blocked_by'"),
];

export const getTasksQueryValidator = [
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
  query("type")
    .optional()
    .isString()
    .withMessage("Type must be a comma-separated string"),
  query("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
  query("featureId")
    .optional()
    .isUUID()
    .withMessage("Feature ID must be a valid UUID"),
  query("sprintId")
    .optional()
    .isUUID()
    .withMessage("Sprint ID must be a valid UUID"),
  query("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Assignee ID must be a valid UUID"),
  query("search").optional().isString().trim(),
];
