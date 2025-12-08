import { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError";

export const errorMiddleware = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId: req.headers["x-request-id"] || "unknown",
      },
    });
  }

  console.error("Unexpected error:", error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      requestId: req.headers["x-request-id"] || "unknown",
    },
  });
};
