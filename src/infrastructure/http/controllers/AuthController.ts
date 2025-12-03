import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '@core/application/use-cases/auth/RegisterUser';
import { LoginUser } from '@core/application/use-cases/auth/LoginUser';
import { JwtService } from '@core/application/services/JwtService';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { RedisCache } from '@infrastructure/cache/RedisCache';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  private registerUser: RegisterUser;
  private loginUser: LoginUser;
  private jwtService: JwtService;
  private redisCache: RedisCache;

  constructor() {
    const userRepository = new UserRepository();
    this.registerUser = new RegisterUser(userRepository);
    this.loginUser = new LoginUser(userRepository);
    this.jwtService = new JwtService();
    this.redisCache = RedisCache.getInstance();
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.registerUser.execute({ email, password, name });

      const accessToken = this.jwtService.generateAccessToken({
        sub: result.userId,
        email: result.email,
        roles: [],
      });

      const refreshToken = this.jwtService.generateRefreshToken(result.userId);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.userId,
            email: result.email,
            name: result.name,
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

      const accessToken = this.jwtService.generateAccessToken({
        sub: result.userId,
        email: result.email,
        workspaceId: result.workspaceId,
        roles: [],
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

      // Check if token is blacklisted
      const isBlacklisted = await this.redisCache.isBlacklisted(refreshToken);
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token has been revoked',
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

      const accessToken = this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
        roles: [],
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
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Add token to blacklist for 7 days (refresh token expiry)
        await this.redisCache.addToBlacklist(refreshToken, 7 * 24 * 60 * 60);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
