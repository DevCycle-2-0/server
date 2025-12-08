import Joi from 'joi';

export const updateMemberProfileSchema = Joi.object({
  title: Joi.string().max(100).allow(null).optional(),
  department: Joi.string().max(100).allow(null).optional(),
  bio: Joi.string().max(500).allow(null).optional(),
  skills: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        level: Joi.string()
          .valid('beginner', 'intermediate', 'advanced', 'expert')
          .required(),
      })
    )
    .optional(),
});

export const addSkillSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced', 'expert')
    .required(),
});

export const updateAvailabilitySchema = Joi.object({
  hours_per_week: Joi.number().min(0).max(168).optional(),
  working_hours: Joi.object().optional(),
  time_off: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid('vacation', 'sick', 'other').required(),
        start_date: Joi.date().iso().required(),
        end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
      })
    )
    .optional(),
});
