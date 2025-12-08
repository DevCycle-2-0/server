import Joi from 'joi';

export const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(50)
    .optional(),
});

export const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  logo_url: Joi.string().uri().allow(null).optional(),
  settings: Joi.object().optional(),
});

export const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'manager', 'member', 'viewer').required(),
});

export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'manager', 'member', 'viewer').required(),
});
