import Joi from "joi";
import { PriorityLevel, ItemStatus } from "@shared/types";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(5000).optional(),
  type: Joi.string().valid("task", "subtask", "story", "epic").optional(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  storyPoints: Joi.number().integer().min(1).max(100).optional(),
  estimatedHours: Joi.number().min(0.25).max(1000).optional(),
  productId: Joi.string().uuid().optional(),
  featureId: Joi.string().uuid().optional(),
  sprintId: Joi.string().uuid().optional(),
  parentTaskId: Joi.string().uuid().optional(),
  assigneeId: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  dueDate: Joi.date().iso().optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(5000).allow(null).optional(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  storyPoints: Joi.number().integer().min(1).max(100).optional(),
  estimatedHours: Joi.number().min(0.25).max(1000).optional(),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
});

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ItemStatus))
    .required(),
  comment: Joi.string().max(500).optional(),
});
