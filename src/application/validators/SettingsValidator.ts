import Joi from 'joi';

export const updateUserSettingsSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').optional(),
  language: Joi.string().min(2).max(5).optional(),
  timezone: Joi.string().optional(),
  date_format: Joi.string().optional(),
  time_format: Joi.string().valid('12h', '24h').optional(),
  notifications: Joi.object().optional(),
  display: Joi.object().optional(),
  accessibility: Joi.object().optional(),
  keyboard_shortcuts: Joi.boolean().optional(),
});

export const updateUserProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  title: Joi.string().max(100).allow(null).optional(),
  department: Joi.string().max(100).allow(null).optional(),
  bio: Joi.string().max(500).allow(null).optional(),
  contact: Joi.object().optional(),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])/)
    .required(),
  new_password_confirmation: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
    }),
});

export const updateWorkspaceSettingsSchema = Joi.object({
  general: Joi.object().optional(),
  features: Joi.object().optional(),
  sprints: Joi.object().optional(),
  notifications: Joi.object().optional(),
  security: Joi.object().optional(),
  branding: Joi.object().optional(),
});

export const addIntegrationSchema = Joi.object({
  type: Joi.string()
    .valid('slack', 'github', 'jira', 'linear', 'figma')
    .required(),
  auth_code: Joi.string().required(),
});

// src/application/validators/AnalyticsValidator.ts
import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
  period: Joi.string().valid('7d', '30d', '90d', '1y').optional(),
  product_id: Joi.string().uuid().optional(),
  sprint_id: Joi.string().uuid().optional(),
  severity: Joi.string().optional(),
});

export const exportDataSchema = Joi.object({
  type: Joi.string()
    .valid(
      'overview',
      'velocity',
      'burndown',
      'bugs',
      'features',
      'releases',
      'team',
      'time-tracking'
    )
    .required(),
  format: Joi.string().valid('csv', 'json', 'pdf').required(),
  period: Joi.string().valid('7d', '30d', '90d', '1y').optional(),
  filters: Joi.object().optional(),
});
