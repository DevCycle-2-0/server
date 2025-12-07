import Joi from "joi";

export const createReleaseSchema = Joi.object({
  version: Joi.string()
    .pattern(/^\d+\.\d+\.\d+$/)
    .required()
    .messages({
      "string.pattern.base": "Version must be in semantic format (e.g., 1.0.0)",
    }),
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(2000).optional(),
  releaseType: Joi.string()
    .valid("major", "minor", "patch", "hotfix")
    .required(),
  productId: Joi.string().uuid().optional(),
  targetDate: Joi.date().iso().optional(),
  pipelineConfig: Joi.object().optional(),
});

export const updateReleaseSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(2000).allow(null).optional(),
  targetDate: Joi.date().iso().allow(null).optional(),
});

export const publishReleaseSchema = Joi.object({
  deployTo: Joi.string().valid("staging", "production").optional(),
  notes: Joi.string().max(500).optional(),
});
