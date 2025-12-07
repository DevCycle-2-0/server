import Joi from "joi";
import { BugSeverity, PriorityLevel } from "@shared/types";

export const createBugSchema = Joi.object({
  title: Joi.string().min(10).max(200).required(),
  description: Joi.string().min(20).max(5000).required(),
  stepsToReproduce: Joi.string().max(2000).optional(),
  expectedBehavior: Joi.string().max(1000).optional(),
  actualBehavior: Joi.string().max(1000).optional(),
  environment: Joi.object().optional(),
  severity: Joi.string()
    .valid(...Object.values(BugSeverity))
    .required(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  productId: Joi.string().uuid().optional(),
  featureId: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  attachments: Joi.array().max(10).optional(),
});

export const updateBugSchema = Joi.object({
  title: Joi.string().min(10).max(200).optional(),
  description: Joi.string().min(20).max(5000).optional(),
  severity: Joi.string()
    .valid(...Object.values(BugSeverity))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  sprintId: Joi.string().uuid().allow(null).optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
});

export const resolveBugSchema = Joi.object({
  resolution: Joi.string().min(10).max(2000).required(),
});
