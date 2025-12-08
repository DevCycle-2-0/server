import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().min(8),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message("Password must contain uppercase, lowercase, and number"),
  name: Joi.string().required().min(2).max(100),
  workspaceName: Joi.string().optional().min(2).max(100),
});
