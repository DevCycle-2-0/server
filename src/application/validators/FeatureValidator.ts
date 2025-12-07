import Joi from "joi";
import { FeatureStage, PriorityLevel } from "@shared/types";

export const createFeatureSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(5000).optional(),
  productId: Joi.string().uuid().optional(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  storyPoints: Joi.number().integer().min(1).max(100).optional(),
  assigneeId: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  dueDate: Joi.date().iso().optional(),
});

export const updateFeatureSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(5000).allow(null).optional(),
  priority: Joi.string()
    .valid(...Object.values(PriorityLevel))
    .optional(),
  storyPoints: Joi.number().integer().min(1).max(100).optional(),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
});

export const changeFeatureStageSchema = Joi.object({
  stage: Joi.string()
    .valid(...Object.values(FeatureStage))
    .required(),
  notes: Joi.string().max(500).optional(),
});
