import { Response, NextFunction } from 'express';
import { UserSettingsModel } from '@infrastructure/database/models/UserSettingsModel';
import { AuthRequest } from '../middleware/auth.middleware';

export class SettingsController {
  getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let settings = await UserSettingsModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!settings) {
        // Create default settings
        settings = await UserSettingsModel.create({
          user_id: req.user!.sub,
        });
      }

      res.json({
        success: true,
        data: {
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone,
          dateFormat: settings.date_format,
          notifications: settings.notifications,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { theme, language, timezone, dateFormat, notifications } = req.body;

      let settings = await UserSettingsModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!settings) {
        settings = await UserSettingsModel.create({
          user_id: req.user!.sub,
        });
      }

      if (theme) settings.theme = theme;
      if (language) settings.language = language;
      if (timezone) settings.timezone = timezone;
      if (dateFormat) settings.date_format = dateFormat;
      if (notifications) settings.notifications = notifications;

      await settings.save();

      res.json({
        success: true,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Same as GET /auth/me
      const userRepository = new (
        await import('@infrastructure/database/repositories/UserRepository')
      ).UserRepository();
      const user = await userRepository.findById(req.user!.sub);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
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
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Delegate to auth controller
      const { name, avatar } = req.body;
      const userRepository = new (
        await import('@infrastructure/database/repositories/UserRepository')
      ).UserRepository();

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
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await UserSettingsModel.findOne({
        where: { user_id: req.user!.sub },
      });

      res.json({
        success: true,
        data: settings?.notifications || {},
      });
    } catch (error) {
      next(error);
    }
  };

  updateNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, push } = req.body;

      let settings = await UserSettingsModel.findOne({
        where: { user_id: req.user!.sub },
      });

      if (!settings) {
        settings = await UserSettingsModel.create({
          user_id: req.user!.sub,
        });
      }

      const currentNotifications = settings.notifications as any;
      settings.notifications = {
        email: email || currentNotifications.email,
        push: push || currentNotifications.push,
      };

      await settings.save();

      res.json({
        success: true,
        message: 'Notification preferences updated',
      });
    } catch (error) {
      next(error);
    }
  };
}
