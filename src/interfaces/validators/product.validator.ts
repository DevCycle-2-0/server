import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(1000),
  platforms: Joi.array()
    .items(Joi.string().valid("web", "android", "ios", "api", "desktop"))
    .required()
    .min(1),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(1000),
  platforms: Joi.array()
    .items(Joi.string().valid("web", "android", "ios", "api", "desktop"))
    .optional()
    .min(1),
});
