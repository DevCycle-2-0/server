// src/infrastructure/http/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '@core/application/use-cases/auth/RegisterUser';
import { LoginUser } from '@core/application/use-cases/auth/LoginUser';
import { JwtService } from '@core/application/services/JwtService';
import { ConsoleEmailService } from '@core/application/services/EmailService';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { WorkspaceRepository } from '@infrastructure/database/repositories/WorkspaceRepository';
import { Workspace } from '@core/domain/entities/Workspace';
import { UserRoleModel } from '@infrastructure/database/models/UserRoleModel';
import { VerificationTokenModel } from '@infrastructure/database/models/VerificationTokenModel';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';

export class AuthControllerComplete {
  private registerUser: RegisterUser;
  private loginUser: LoginUser;
  private jwtService: JwtService;
  private emailService: ConsoleEmailService;
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    const userRepository = new UserRepository();
    this.registerUser = new RegisterUser(userRepository);
    this.loginUser = new LoginUser(userRepository);
    this.jwtService = new JwtService();
    this.emailService = new ConsoleEmailService();
    this.workspaceRepository = new WorkspaceRepository();
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      // Register user
      const result = await this.registerUser.execute({ email, password, name });

      // Create workspace for user
      const workspaceName = `${name}'s Workspace`;
      const workspace = Workspace.create(workspaceName, result.userId);
      await this.workspaceRepository.save(workspace);

      // Assign user to workspace
      const userRepository = new UserRepository();
      const user = await userRepository.findById(result.userId);
      if (user) {
        user.joinWorkspace(workspace.id);
        await userRepository.update(user);
      }

      // Assign owner role
      await UserRoleModel.create({
        user_id: result.userId,
        workspace_id: workspace.id,
        role: 'owner',
      });

      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        sub: result.userId,
        email: result.email,
        workspaceId: workspace.id,
        roles: ['owner'],
      });

      const refreshToken = this.jwtService.generateRefreshToken(result.userId);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.userId,
            email: result.email,
            name: result.name,
            workspaceId: workspace.id,
          },
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.loginUser.execute({ email, password });

      // Get user roles
      const roles = await UserRoleModel.findAll({
        where: { user_id: result.userId },
        attributes: ['role'],
      });

      const roleNames = roles.map((r) => r.role);

      const accessToken = this.jwtService.generateAccessToken({
        sub: result.userId,
        email: result.email,
        workspaceId: result.workspaceId,
        roles: roleNames,
      });

      const refreshToken = this.jwtService.generateRefreshToken(result.userId);

      res.json({
        success: true,
        data: {
          user: {
            id: result.userId,
            email: result.email,
            name: result.name,
            workspaceId: result.workspaceId,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
        });
        return;
      }

      const decoded = this.jwtService.verifyRefreshToken(refreshToken);

      const userRepository = new UserRepository();
      const user = await userRepository.findById(decoded.sub);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token',
          },
        });
        return;
      }

      // Get user roles
      const roles = await UserRoleModel.findAll({
        where: { user_id: user.id },
        attributes: ['role'],
      });

      const roleNames = roles.map((r) => r.role);

      const accessToken = this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
        roles: roleNames,
      });

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.findById(req.user!.sub);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          workspaceId: user.workspaceId,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Add token to blacklist if Redis is configured
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, avatar } = req.body;
      const userRepository = new UserRepository();

      const user = await userRepository.findById(req.user!.sub);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      user.updateProfile(name, avatar);
      await userRepository.update(user);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await UserRoleModel.findAll({
        where: { user_id: req.user!.sub },
        attributes: ['role', 'workspace_id'],
      });

      res.json({
        success: true,
        data: roles.map((r) => ({
          role: r.role,
          workspaceId: r.workspace_id,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      const verificationToken = await VerificationTokenModel.findOne({
        where: { token, type: 'email_verification', used: false },
      });

      if (!verificationToken) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        });
        return;
      }

      if (new Date() > verificationToken.expires_at) {
        res.status(400).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
        });
        return;
      }

      const userRepository = new UserRepository();
      const user = await userRepository.findById(verificationToken.user_id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VERIFIED', message: 'Email already verified' },
        });
        return;
      }

      user.verifyEmail();
      await userRepository.update(user);

      verificationToken.used = true;
      await verificationToken.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userRepository = new UserRepository();
      const user = await userRepository.findById(req.user!.sub);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VERIFIED', message: 'Email already verified' },
        });
        return;
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await VerificationTokenModel.create({
        user_id: user.id,
        token,
        type: 'email_verification',
        expires_at: expiresAt,
      });

      await this.emailService.sendVerificationEmail(user.email, token);

      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      next(error);
    }
  };

  requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const userRepository = new UserRepository();

      const user = await userRepository.findByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        res.json({
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.',
        });
        return;
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await VerificationTokenModel.create({
        user_id: user.id,
        token,
        type: 'password_reset',
        expires_at: expiresAt,
      });

      await this.emailService.sendPasswordResetEmail(user.email, token);

      res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const resetToken = await VerificationTokenModel.findOne({
        where: { token, type: 'password_reset', used: false },
      });

      if (!resetToken) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        });
        return;
      }

      if (new Date() > resetToken.expires_at) {
        res.status(400).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
        });
        return;
      }

      const userRepository = new UserRepository();
      const user = await userRepository.findById(resetToken.user_id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      await user.changePassword(newPassword);
      await userRepository.update(user);

      resetToken.used = true;
      await resetToken.save();

      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userRepository = new UserRepository();

      const user = await userRepository.findById(req.user!.sub);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
        });
        return;
      }

      if (currentPassword === newPassword) {
        res.status(400).json({
          success: false,
          error: { code: 'SAME_PASSWORD', message: 'New password must be different' },
        });
        return;
      }

      await user.changePassword(newPassword);
      await userRepository.update(user);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
