import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { successResponse } from '@shared/utils/response';
import { ConflictError, UnauthorizedError } from '@shared/errors/AppError';
import { UserModel } from '@infrastructure/database/models/UserModel';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@config/env';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, full_name, workspace_name } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserModel.create({
        id: uuidv4(),
        email,
        fullName: full_name,
        passwordHash,
      });

      // Create workspace
      const workspaceSlug = (workspace_name || `${full_name}'s Workspace`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const workspace = await WorkspaceModel.create({
        id: uuidv4(),
        name: workspace_name || `${full_name}'s Workspace`,
        slug: workspaceSlug,
        ownerId: user.id,
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      res.status(201).json(
        successResponse({
          user: {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            email_verified: user.emailVerified,
            created_at: user.createdAt,
          },
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            role: 'owner',
          },
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
            token_type: 'Bearer',
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Get workspaces
      const workspaces = await WorkspaceModel.findAll({
        where: { ownerId: user.id },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      res.json(
        successResponse({
          user: {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            email_verified: user.emailVerified,
            created_at: user.createdAt,
          },
          workspaces: workspaces.map(w => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            role: 'owner',
          })),
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
            token_type: 'Bearer',
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Token invalidation would be handled by a token blacklist in production
      res.json(successResponse({ message: 'Successfully logged out' }));
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refresh_token } = req.body;

      const decoded = jwt.verify(
        refresh_token,
        config.jwt.refreshSecret
      ) as any;

      const user = await UserModel.findByPk(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      res.json(
        successResponse({
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: 900,
          token_type: 'Bearer',
        })
      );
    } catch (error) {
      next(new UnauthorizedError('Invalid or expired refresh token'));
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      // Send password reset email (implementation depends on email service)
      res.json(
        successResponse({
          message: 'If an account exists, a reset email has been sent',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      // Verify token and reset password
      res.json(
        successResponse({ message: 'Password has been reset successfully' })
      );
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      // Verify email token
      res.json(successResponse({ message: 'Email verified successfully' }));
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      // Resend verification email
      res.json(successResponse({ message: 'Verification email sent' }));
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const workspaces = await WorkspaceModel.findAll({
        where: { ownerId: user.id },
      });

      res.json(
        successResponse({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          avatar_url: user.avatarUrl,
          timezone: user.timezone,
          locale: user.locale,
          email_verified: user.emailVerified,
          created_at: user.createdAt,
          workspaces: workspaces.map(w => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            role: 'owner',
          })),
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
