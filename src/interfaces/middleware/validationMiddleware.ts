import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "@shared/errors/AppError";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details: Record<string, string[]> = {};
      error.details.forEach((detail) => {
        const key = detail.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(detail.message);
      });

      throw AppError.badRequest("Validation failed", details);
    }

    next();
  };
};
