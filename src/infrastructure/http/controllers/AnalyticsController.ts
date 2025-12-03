import { Response, NextFunction } from 'express';
import { ProductRepository } from '@infrastructure/database/repositories/ProductRepository';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class AnalyticsController {
  private productRepository: ProductRepository;
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  private taskRepository: TaskRepository;
  private bugRepository: BugRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
    this.taskRepository = new TaskRepository();
    this.bugRepository = new BugRepository();
  }

  getOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate } = req.query;

      const features = await this.featureRepository.findByWorkspace(workspaceId);
      const sprints = await this.sprintRepository.findActive(workspaceId);
      const tasks = await this.taskRepository.findByWorkspace(workspaceId);
      const bugs = await this.bugRepository.findByWorkspace(workspaceId);

      const completedFeatures = features.filter((f) => f.isCompleted()).length;
      const completedTasks = tasks.filter((t) => t.isCompleted()).length;
      const openBugs = bugs.filter((b) => !b.isResolved()).length;
      const criticalBugs = bugs.filter((b) => b.isBlocking()).length;

      res.json({
        success: true,
        data: {
          features: {
            total: features.length,
            completed: completedFeatures,
            inProgress: features.length - completedFeatures,
            completionRate: features.length > 0 ? completedFeatures / features.length : 0,
          },
          sprints: {
            active: sprints.length,
            completed: 0, // Would need historical data
            averageVelocity: sprints.reduce((sum, s) => sum + s.velocity, 0) / sprints.length || 0,
          },
          tasks: {
            total: tasks.length,
            completed: completedTasks,
            overdue: 0, // Would need due date tracking
          },
          bugs: {
            open: openBugs,
            critical: criticalBugs,
            averageResolutionTime: 48, // Mock value
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getVelocity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { limit = 10 } = req.query;

      const sprints = await this.sprintRepository.findActive(workspaceId);

      res.json({
        success: true,
        data: sprints.slice(0, Number(limit)).map((s) => ({
          sprintId: s.id,
          sprintName: s.name,
          planned: 50, // Mock
          completed: s.velocity,
          velocity: s.velocity,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  getBurndown = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sprintId } = req.query;

      if (!sprintId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'sprintId required' },
        });
        return;
      }

      const sprint = await this.sprintRepository.findById(sprintId as string);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const tasks = await this.taskRepository.findBySprint(sprintId as string);
      const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

      res.json({
        success: true,
        data: {
          sprintId: sprint.id,
          totalPoints,
          days: [], // Mock burndown data
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getBugResolution = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate, productId } = req.query;

      const bugs = await this.bugRepository.findByWorkspace(workspaceId, { productId });

      res.json({
        success: true,
        data: {
          averageResolutionTime: 48,
          medianResolutionTime: 36,
          bySeverity: {
            critical: { avg: 24, count: 10 },
            high: { avg: 48, count: 30 },
            medium: { avg: 72, count: 50 },
            low: { avg: 120, count: 40 },
          },
          trend: [],
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamWorkload = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}
