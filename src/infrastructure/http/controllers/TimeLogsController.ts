import { Response, NextFunction } from 'express';
import { TimeLog } from '@core/domain/entities/TimeLog';
import { TimeLogRepository } from '@infrastructure/database/repositories/TimeLogRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class TimeLogsController {
  private timeLogRepository: TimeLogRepository;
  private taskRepository: TaskRepository;

  constructor() {
    this.timeLogRepository = new TimeLogRepository();
    this.taskRepository = new TaskRepository();
  }

  /**
   * POST /tasks/:taskId/time-logs
   * Log time on a task
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { hours, date, description } = req.body;
      const userId = req.user!.sub;

      // Validate task exists
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      // Create time log
      const timeLog = TimeLog.create(
        taskId,
        userId,
        parseFloat(hours),
        new Date(date),
        description
      );

      await this.timeLogRepository.save(timeLog);

      // Update task actual hours
      task.logTime(parseFloat(hours));
      await this.taskRepository.update(task);

      res.status(201).json({
        success: true,
        data: {
          id: timeLog.id,
          taskId: timeLog.taskId,
          userId: timeLog.userId,
          hours: timeLog.hours,
          date: timeLog.date,
          description: timeLog.description,
          createdAt: timeLog.createdAt,
        },
        message: 'Time logged successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tasks/:taskId/time-logs
   * Get all time logs for a task
   */
  listByTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;

      const timeLogs = await this.timeLogRepository.findByTask(taskId);

      res.json({
        success: true,
        data: timeLogs.map((log) => ({
          id: log.id,
          taskId: log.taskId,
          userId: log.userId,
          hours: log.hours,
          date: log.date,
          description: log.description,
          createdAt: log.createdAt,
        })),
        summary: {
          totalHours: timeLogs.reduce((sum, log) => sum + log.hours, 0),
          entries: timeLogs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /users/:userId/time-logs
   * Get time logs for a user
   */
  listByUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const timeLogs = await this.timeLogRepository.findByUser(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: timeLogs.map((log) => ({
          id: log.id,
          taskId: log.taskId,
          hours: log.hours,
          date: log.date,
          description: log.description,
          createdAt: log.createdAt,
        })),
        summary: {
          totalHours: timeLogs.reduce((sum, log) => sum + log.hours, 0),
          entries: timeLogs.length,
          period: {
            start: startDate || 'all time',
            end: endDate || 'now',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /time-logs/:id
   * Delete a time log
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const timeLog = await this.timeLogRepository.findById(id);
      if (!timeLog) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Time log not found' },
        });
        return;
      }

      // Only the user who created the log can delete it
      if (timeLog.userId !== userId) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: "Cannot delete another user's time log" },
        });
        return;
      }

      // Update task actual hours
      const task = await this.taskRepository.findById(timeLog.taskId);
      if (task && task.actualHours) {
        const newActualHours = Math.max(0, task.actualHours - timeLog.hours);
        task.logTime(-timeLog.hours); // Subtract hours
        await this.taskRepository.update(task);
      }

      await this.timeLogRepository.delete(id);

      res.json({
        success: true,
        message: 'Time log deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
