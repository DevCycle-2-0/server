import Joi from "joi";

export const createSprintSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  goal: Joi.string().max(500).optional(),
  productId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  capacityPoints: Joi.number().integer().min(1).max(200).optional(),
});

export const updateSprintSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  goal: Joi.string().max(500).allow(null).optional(),
  endDate: Joi.date().iso().optional(),
  capacityPoints: Joi.number().integer().min(1).max(200).optional(),
});
