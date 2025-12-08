import Joi from 'joi';

export const createSubscriptionSchema = Joi.object({
  plan_id: Joi.string()
    .valid('free', 'starter', 'professional', 'enterprise')
    .required(),
  billing_cycle: Joi.string().valid('monthly', 'yearly').required(),
  payment_method_id: Joi.string().required(),
  seats: Joi.number().integer().min(1).optional(),
});

export const updateSubscriptionSchema = Joi.object({
  plan_id: Joi.string()
    .valid('starter', 'professional', 'enterprise')
    .optional(),
  seats: Joi.number().integer().min(1).optional(),
});

export const cancelSubscriptionSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
  feedback: Joi.string().max(1000).optional(),
  cancel_at_period_end: Joi.boolean().optional(),
});

export const addPaymentMethodSchema = Joi.object({
  payment_method_id: Joi.string().required(),
  set_as_default: Joi.boolean().optional(),
});
