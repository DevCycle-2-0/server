import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Role, UserRole } from '@core/domain/value-objects/Role';

export const checkPermission = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roles) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No roles assigned',
        },
      });
      return;
    }

    const hasPermission = req.user.roles.some((roleName) => {
      const role = Role.create(roleName);
      return role.hasPermission(requiredPermission);
    });

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
};
