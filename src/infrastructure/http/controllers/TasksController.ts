import { Response, NextFunction } from 'express';
import { Task } from '@core/domain/entities/Task';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class TasksController {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to a workspace' },
        });
        return;
      }

      const { status, priority, assigneeId, isBlocked, limit, offset } = req.query;

      const tasks = await this.taskRepository.findByWorkspace(workspaceId, {
        status,
        priority,
        assigneeId,
        isBlocked: isBlocked === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        data: tasks.map((t) => ({
          id: t.id,
          workspaceId: t.workspaceId,
          sprintId: t.sprintId,
          featureId: t.featureId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          estimatedHours: t.estimatedHours,
          actualHours: t.actualHours,
          isBlocked: t.isBlocked,
          blockedReason: t.blockedReason,
          tags: t.tags,
          completedAt: t.completedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to a workspace' },
        });
        return;
      }

      const { title, description, featureId, sprintId } = req.body;

      const task = Task.create(workspaceId, title, description, featureId, sprintId);
      await this.taskRepository.save(task);

      res.status(201).json({
        success: true,
        data: { taskId: task.id, title: task.title, status: task.status },
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.changeStatus(status);
      await this.taskRepository.update(task);

      res.json({ success: true, message: 'Task status updated successfully' });
    } catch (error) {
      next(error);
    }
  };
}
