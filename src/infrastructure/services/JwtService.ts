import jwt from "jsonwebtoken";
import { AppError } from "@shared/errors/AppError";

export class JwtService {
  static generateAccessToken(payload: {
    userId: string;
    email: string;
  }): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  }

  static generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw AppError.unauthorized("Invalid or expired token");
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch (error) {
      throw AppError.unauthorized("Invalid refresh token");
    }
  }
}
