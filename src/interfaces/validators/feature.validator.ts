import Joi from "joi";

export const createFeatureSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10).max(5000),
  priority: Joi.string().required().valid("low", "medium", "high", "critical"),
  productId: Joi.string().uuid().required(),
  platform: Joi.string()
    .required()
    .valid("web", "android", "ios", "api", "desktop"),
  tags: Joi.array().items(Joi.string()).optional(),
  dueDate: Joi.date().optional(),
});

export const updateFeatureSchema = Joi.object({
  title: Joi.string().optional().min(5).max(200),
  description: Joi.string().optional().min(10).max(5000),
  priority: Joi.string().optional().valid("low", "medium", "high", "critical"),
  estimatedHours: Joi.number().optional().positive().max(999),
  tags: Joi.array().items(Joi.string()).optional(),
});
