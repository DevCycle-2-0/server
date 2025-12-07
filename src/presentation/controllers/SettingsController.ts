import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserModel } from '@infrastructure/database/models/UserModel';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import { successResponse } from '@shared/utils/response';
import { NotFoundError, ValidationError } from '@shared/errors/AppError';
import bcrypt from 'bcryptjs';

export class SettingsController {
  // User Settings
  getUserSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json(
        successResponse({
          user_id: user.id,
          theme: 'system',
          language: user.locale,
          timezone: user.timezone,
          date_format: 'MMM dd, yyyy',
          time_format: '12h',
          notifications: {
            email: {
              enabled: true,
              digest: 'daily',
              task_assigned: true,
              task_completed: true,
              mentions: true,
              sprint_updates: true,
              release_updates: true,
            },
            push: {
              enabled: true,
              task_assigned: true,
              mentions: true,
              urgent_only: false,
            },
            desktop: {
              enabled: true,
              sound: true,
            },
          },
          display: {
            compact_mode: false,
            show_avatars: true,
            sidebar_collapsed: false,
            default_view: 'list',
          },
          accessibility: {
            reduce_motion: false,
            high_contrast: false,
            font_size: 'medium',
          },
          keyboard_shortcuts: true,
          two_factor_enabled: false,
          updated_at: user.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateUserSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const { theme, language, timezone, notifications, display } = req.body;

      if (timezone) user.timezone = timezone;
      if (language) user.locale = language;
      await user.save();

      res.json(
        successResponse({
          theme: theme || 'system',
          language: user.locale,
          timezone: user.timezone,
          notifications,
          display,
          updated_at: user.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateUserProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const { full_name, title, department, bio, contact } = req.body;

      if (full_name) user.fullName = full_name;
      await user.save();

      res.json(
        successResponse({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          title,
          department,
          bio,
          avatar_url: user.avatarUrl,
          contact,
          updated_at: user.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder for file upload logic
      const avatarUrl = 'https://storage.example.com/avatars/placeholder.jpg';

      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.avatarUrl = avatarUrl;
      await user.save();

      res.json(
        successResponse({
          avatar_url: avatarUrl,
          updated_at: user.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteAvatar = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.avatarUrl = null;
      await user.save();

      res.json(successResponse({ message: 'Avatar removed' }));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { current_password, new_password, new_password_confirmation } =
        req.body;

      if (new_password !== new_password_confirmation) {
        throw new ValidationError("Passwords don't match");
      }

      const user = await UserModel.findByPk(req.user!.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isValid = await bcrypt.compare(current_password, user.passwordHash);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }

      user.passwordHash = await bcrypt.hash(new_password, 10);
      await user.save();

      res.json(successResponse({ message: 'Password changed successfully' }));
    } catch (error) {
      next(error);
    }
  };

  // Workspace Settings
  getWorkspaceSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const workspace = await WorkspaceModel.findByPk(id);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      res.json(
        successResponse({
          workspace_id: workspace.id,
          general: {
            name: workspace.name,
            slug: workspace.slug,
            logo_url: workspace.logoUrl,
            default_timezone: 'America/New_York',
            week_start: 'monday',
          },
          features: {
            feature_voting: true,
            public_roadmap: false,
            require_feature_approval: true,
            auto_close_resolved_bugs: true,
          },
          sprints: {
            default_duration_weeks: 2,
            auto_create_next: true,
            require_retrospective: true,
          },
          notifications: {
            daily_digest: true,
            sprint_reminders: true,
            release_announcements: true,
          },
          security: {
            require_2fa: false,
            allowed_email_domains: [],
            session_timeout_hours: 24,
            ip_whitelist: [],
          },
          branding: {
            primary_color: '#6366F1',
            logo_url: workspace.logoUrl,
            favicon_url: null,
          },
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateWorkspaceSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const workspace = await WorkspaceModel.findByPk(id);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      const { general, features, sprints, security } = req.body;

      if (general) {
        if (general.name) workspace.name = general.name;
        if (general.logo_url !== undefined)
          workspace.logoUrl = general.logo_url;
      }

      workspace.settings = {
        ...workspace.settings,
        ...(features && { features }),
        ...(sprints && { sprints }),
        ...(security && { security }),
      };

      await workspace.save();

      res.json(
        successResponse({
          workspace_id: workspace.id,
          general,
          features,
          sprints,
          security,
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listIntegrations = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder for integrations
      res.json(
        successResponse({
          data: [],
          available: [
            {
              type: 'slack',
              name: 'Slack',
              description: 'Connect your workspace to Slack',
              icon_url: 'https://example.com/slack-icon.png',
            },
            {
              type: 'github',
              name: 'GitHub',
              description: 'Link GitHub repositories',
              icon_url: 'https://example.com/github-icon.png',
            },
          ],
        })
      );
    } catch (error) {
      next(error);
    }
  };

  addIntegration = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { type, auth_code } = req.body;

      res.status(201).json(
        successResponse({
          id: 'int-001',
          type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          status: 'connected',
          config: {},
          connected_at: new Date(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  removeIntegration = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(successResponse({ message: 'Integration disconnected' }));
    } catch (error) {
      next(error);
    }
  };

  listSessions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        successResponse([
          {
            id: 'sess-001',
            device: {
              type: 'desktop',
              os: 'macOS 14.2',
              browser: 'Chrome 122',
            },
            ip_address: '192.168.1.1',
            location: 'New York, NY, US',
            is_current: true,
            last_active: new Date(),
            created_at: new Date(),
          },
        ])
      );
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(successResponse({ message: 'Session revoked' }));
    } catch (error) {
      next(error);
    }
  };
}
