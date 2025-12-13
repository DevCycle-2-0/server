import { body } from "express-validator";

const validGateTypes = [
  "design_review",
  "technical_review",
  "security_review",
  "release_approval",
];

// FIXED: Make gates optional since we can use defaults
export const initializeWorkflowValidator = [
  body("gates").optional().isArray().withMessage("Gates must be an array"),
  body("gates.*.type")
    .if(body("gates").exists())
    .isIn(validGateTypes)
    .withMessage(`Gate type must be one of: ${validGateTypes.join(", ")}`),
  body("gates.*.label")
    .if(body("gates").exists())
    .isString()
    .withMessage("Gate label must be a string"),
  body("gates.*.order")
    .if(body("gates").exists())
    .isInt({ min: 1 })
    .withMessage("Gate order must be a positive integer"),
];

export const approveGateValidator = [
  body("gateId")
    .notEmpty()
    .withMessage("Gate ID is required")
    .isUUID()
    .withMessage("Gate ID must be a valid UUID"),
];

export const rejectGateValidator = [
  body("gateId")
    .notEmpty()
    .withMessage("Gate ID is required")
    .isUUID()
    .withMessage("Gate ID must be a valid UUID"),
  body("reason").notEmpty().withMessage("Reason is required").isString().trim(),
];

export const requestChangesValidator = [
  body("gateId")
    .notEmpty()
    .withMessage("Gate ID is required")
    .isUUID()
    .withMessage("Gate ID must be a valid UUID"),
  body("comment")
    .notEmpty()
    .withMessage("Comment is required")
    .isString()
    .trim(),
];

export const addCommentValidator = [
  body("gateId")
    .notEmpty()
    .withMessage("Gate ID is required")
    .isUUID()
    .withMessage("Gate ID must be a valid UUID"),
  body("text")
    .notEmpty()
    .withMessage("Comment text is required")
    .isString()
    .trim(),
];

export const assignGateValidator = [
  body("gateId")
    .notEmpty()
    .withMessage("Gate ID is required")
    .isUUID()
    .withMessage("Gate ID must be a valid UUID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
  body("userName")
    .notEmpty()
    .withMessage("User name is required")
    .isString()
    .trim(),
];
