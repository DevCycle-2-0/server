import { Request, Response, NextFunction } from "express";
import { JwtService } from "@infrastructure/services/JwtService";
import { AppError } from "@shared/errors/AppError";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = JwtService.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
