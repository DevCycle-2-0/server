import { Request, Response, NextFunction } from "express";
import { LoginUseCase } from "@application/use-cases/auth/LoginUseCase";
import { SignupUseCase } from "@application/use-cases/auth/SignupUseCase";
import { AuthRequest } from "../middleware/authMiddleware";
import { UserRepository } from "@infrastructure/repositories/UserRepository";
import { AppError } from "@shared/errors/AppError";

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private signupUseCase: SignupUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.signupUseCase.execute(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.findById(req.user!.userId);

      if (!user) throw AppError.notFound("User not found");

      res.status(200).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          workspaceId: user.workspaceId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.update(req.user!.userId, req.body);

      res.status(200).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
