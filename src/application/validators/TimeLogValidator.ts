import Joi from 'joi';

export const logTimeSchema = Joi.object({
  hours: Joi.number().min(0.25).max(24).required(),
  description: Joi.string().max(500).optional(),
  logged_date: Joi.date().iso().optional(),
});

export const getTimeLogsSchema = Joi.object({
  user_id: Joi.string().uuid().optional(),
  from_date: Joi.date().iso().optional(),
  to_date: Joi.date().iso().optional(),
});
