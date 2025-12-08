import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  logo_url: Joi.string().uri().optional(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  settings: Joi.object().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).allow(null).optional(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  status: Joi.string().valid('active', 'archived').optional(),
  settings: Joi.object().optional(),
});
