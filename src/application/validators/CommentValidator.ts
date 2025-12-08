import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  parent_id: Joi.string().uuid().allow(null).optional(),
  mentions: Joi.array().items(Joi.string().uuid()).max(10).optional(),
  attachments: Joi.array().max(5).optional(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
});

// src/application/validators/TimeLogValidator.ts
import Joi from 'joi';

export const logTimeSchema = Joi.object({
  hours: Joi.number().min(0.25).max(24).required(),
  description: Joi.string().max(500).optional(),
  logged_date: Joi.date().iso().optional(),
});
