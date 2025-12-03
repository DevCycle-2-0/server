import { Response, NextFunction } from 'express';
import { CreateSprint } from '@core/application/use-cases/sprints/CreateSprint';
import { StartSprint } from '@core/application/use-cases/sprints/StartSprint';
import { GetSprintMetrics } from '@core/application/use-cases/sprints/GetSprintMetrics';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class SprintsController {
  private createSprint: CreateSprint;
  private startSprint: StartSprint;
  private getSprintMetrics: GetSprintMetrics;
  private sprintRepository: SprintRepository;

  constructor() {
    this.sprintRepository = new SprintRepository();
    const taskRepository = new TaskRepository();
    this.createSprint = new CreateSprint(this.sprintRepository);
    this.startSprint = new StartSprint(this.sprintRepository);
    this.getSprintMetrics = new GetSprintMetrics(this.sprintRepository, taskRepository);
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

      const { productId } = req.query;
      const sprints = productId
        ? await this.sprintRepository.findByProduct(productId as string)
        : await this.sprintRepository.findActive(workspaceId);

      res.json({
        success: true,
        data: sprints.map((s) => ({
          id: s.id,
          workspaceId: s.workspaceId,
          productId: s.productId,
          name: s.name,
          goal: s.goal,
          status: s.status,
          duration: s.duration,
          startDate: s.startDate,
          endDate: s.endDate,
          velocity: s.velocity,
          daysRemaining: s.getDaysRemaining(),
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
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

      const { productId, name, startDate, duration, goal } = req.body;

      const result = await this.createSprint.execute({
        workspaceId,
        productId,
        name,
        startDate: new Date(startDate),
        duration,
        goal,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  start = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.startSprint.execute({ sprintId: id });
      res.json({ success: true, message: 'Sprint started successfully' });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const metrics = await this.getSprintMetrics.execute(id);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  };
}
