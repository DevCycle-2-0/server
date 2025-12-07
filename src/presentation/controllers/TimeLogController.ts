import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { LogTimeUseCase } from '@application/use-cases/task/LogTimeUseCase';
import { TimeLogModel } from '@infrastructure/database/models/TimeLogModel';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { ValidationError } from '@shared/errors/AppError';

export class TimeLogController {
  private logTimeUseCase: LogTimeUseCase;

  constructor() {
    this.logTimeUseCase = new LogTimeUseCase();
  }

  logTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const { hours, description, logged_date } = req.body;

      if (!hours || hours <= 0 || hours > 24) {
        throw new ValidationError('Hours must be between 0.25 and 24');
      }

      const timeLog = await this.logTimeUseCase.execute(
        taskId,
        req.user!.userId,
        hours,
        description,
        logged_date ? new Date(logged_date) : undefined
      );

      res.status(201).json(
        successResponse({
          id: timeLog.id,
          task_id: timeLog.taskId,
          hours: timeLog.hours,
          description: timeLog.description,
          logged_date: timeLog.loggedDate,
          user: {
            id: req.user!.userId,
            full_name: 'User',
          },
          created_at: timeLog.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getTimeLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const { user_id, from_date, to_date } = req.query;

      const where: any = { taskId };

      if (user_id) where.userId = user_id;
      if (from_date || to_date) {
        where.loggedDate = {};
        if (from_date) where.loggedDate.$gte = new Date(from_date as string);
        if (to_date) where.loggedDate.$lte = new Date(to_date as string);
      }

      const timeLogs = await TimeLogModel.findAll({
        where,
        include: ['user'],
        order: [['loggedDate', 'DESC']],
      });

      const totalHours = timeLogs.reduce(
        (sum, log) => sum + Number(log.hours),
        0
      );

      // Group by date
      const byDate = timeLogs.reduce((acc: any, log) => {
        const date = log.loggedDate.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(log.hours);
        return acc;
      }, {});

      res.json(
        successResponse({
          data: timeLogs.map(log => ({
            id: log.id,
            hours: log.hours,
            description: log.description,
            logged_date: log.loggedDate,
            user: {
              id: log.user?.id,
              full_name: log.user?.fullName,
              avatar_url: log.user?.avatarUrl,
            },
            created_at: log.createdAt,
          })),
          summary: {
            total_hours: totalHours,
            by_date: Object.entries(byDate).map(([date, hours]) => ({
              date,
              hours,
            })),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  deleteTimeLog = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await TimeLogModel.destroy({ where: { id } });
      res.json(successResponse({ message: 'Time log deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
