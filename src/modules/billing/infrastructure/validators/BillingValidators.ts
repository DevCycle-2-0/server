import { body, param } from "express-validator";

export const createSubscriptionValidator = [
  body("planId")
    .isIn(["free", "pro", "team", "enterprise"])
    .withMessage("Plan ID must be one of: free, pro, team, enterprise"),
  body("interval")
    .isIn(["monthly", "yearly"])
    .withMessage("Interval must be either monthly or yearly"),
];

export const updateSubscriptionValidator = [
  body("planId")
    .isIn(["free", "pro", "team", "enterprise"])
    .withMessage("Plan ID must be one of: free, pro, team, enterprise"),
];

export const addPaymentMethodValidator = [
  body("token")
    .notEmpty()
    .withMessage("Payment token is required")
    .isString()
    .withMessage("Token must be a string"),
];

export const invoiceIdValidator = [
  param("id").isUUID().withMessage("Invoice ID must be a valid UUID"),
];

export const paymentMethodIdValidator = [
  param("id").isUUID().withMessage("Payment method ID must be a valid UUID"),
];
