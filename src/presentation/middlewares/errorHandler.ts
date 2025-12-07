import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors/AppError';
import { errorResponse } from '@shared/utils/response';
import logger from '@shared/utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.code || 'ERROR', err.details));
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json(
      errorResponse('Validation error', 'VALIDATION_ERROR', {
        errors: (err as any).errors?.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      })
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(
      errorResponse('Resource already exists', 'CONFLICT', {
        fields: (err as any).fields,
      })
    );
  }

  // Default error
  res
    .status(500)
    .json(errorResponse('Internal server error', 'INTERNAL_ERROR'));
};
