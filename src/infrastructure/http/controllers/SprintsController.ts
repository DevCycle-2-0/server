import { Response, NextFunction } from 'express';
import { CreateSprint } from '@core/application/use-cases/sprints/CreateSprint';
import { StartSprint } from '@core/application/use-cases/sprints/StartSprint';
import { GetSprintMetrics } from '@core/application/use-cases/sprints/GetSprintMetrics';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { AuthRequest } from '../middleware/auth.middleware';

// In-memory storage for retrospectives (replace with database in production)
interface SprintRetrospective {
  sprintId: string;
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class SprintsController {
  private createSprint: CreateSprint;
  private startSprint: StartSprint;
  private getSprintMetrics: GetSprintMetrics;
  private sprintRepository: SprintRepository;
  private taskRepository: TaskRepository;
  private bugRepository: BugRepository;

  // Temporary in-memory storage
  private retrospectives: Map<string, SprintRetrospective> = new Map();

  constructor() {
    this.sprintRepository = new SprintRepository();
    this.taskRepository = new TaskRepository();
    this.bugRepository = new BugRepository();
    this.createSprint = new CreateSprint(this.sprintRepository);
    this.startSprint = new StartSprint(this.sprintRepository);
    this.getSprintMetrics = new GetSprintMetrics(this.sprintRepository, this.taskRepository);
  }

  /**
   * GET /sprints
   * List all sprints with pagination and filters
   */
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

      const { page = '1', limit = '50', status, productId } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const sprints = productId
        ? await this.sprintRepository.findByProduct(productId as string)
        : await this.sprintRepository.findActive(workspaceId);

      // Apply status filter
      let filteredSprints = sprints;
      if (status) {
        filteredSprints = sprints.filter((s) => s.status === status);
      }

      // Paginate
      const total = filteredSprints.length;
      const paginatedSprints = filteredSprints.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: paginatedSprints.map((s) => ({
          id: s.id,
          name: s.name,
          goal: s.goal,
          status: s.status,
          productId: s.productId,
          startDate: s.startDate,
          endDate: s.endDate,
          velocity: s.velocity,
          daysRemaining: s.getDaysRemaining(),
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sprints/:id
   * Get sprint by ID
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const sprint = await this.sprintRepository.findById(id);

      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: sprint.id,
          name: sprint.name,
          goal: sprint.goal,
          status: sprint.status,
          productId: sprint.productId,
          workspaceId: sprint.workspaceId,
          duration: sprint.duration,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          velocity: sprint.velocity,
          daysRemaining: sprint.getDaysRemaining(),
          createdAt: sprint.createdAt,
          updatedAt: sprint.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sprints
   * Create new sprint
   */
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

  /**
   * PATCH /sprints/:id
   * Update sprint
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, goal } = req.body;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      sprint.update({ name, goal });
      await this.sprintRepository.update(sprint);

      res.json({
        success: true,
        data: {
          id: sprint.id,
          name: sprint.name,
          goal: sprint.goal,
          updatedAt: sprint.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /sprints/:id
   * Delete sprint
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      // Don't allow deletion of active sprints
      if (sprint.isActive()) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot delete active sprint' },
        });
        return;
      }

      await this.sprintRepository.delete(id);

      // Clean up retrospective if exists
      this.retrospectives.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sprints/:id/start
   * Start sprint
   */
  start = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.startSprint.execute({ sprintId: id });
      res.json({ success: true, message: 'Sprint started successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sprints/:id/complete
   * Complete sprint
   */
  complete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      sprint.complete();
      await this.sprintRepository.update(sprint);

      res.json({
        success: true,
        data: {
          id: sprint.id,
          status: sprint.status,
          updatedAt: sprint.updatedAt,
        },
        message: 'Sprint completed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sprints/:id/tasks
   * Get sprint tasks
   */
  getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const tasks = await this.taskRepository.findBySprint(id);

      res.json({
        success: true,
        data: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          featureId: t.featureId,
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

  /**
   * POST /sprints/:id/tasks
   * Add task to sprint
   */
  addTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { taskId } = req.body;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const taskRepository = new TaskRepository();
      const task = await taskRepository.findById(taskId);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.addToSprint(id);
      await taskRepository.update(task);

      res.status(201).json({
        success: true,
        message: 'Task added to sprint',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /sprints/:id/tasks/:taskId
   * Remove task from sprint
   */
  removeTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, taskId } = req.params;

      const taskRepository = new TaskRepository();
      const task = await taskRepository.findById(taskId);
      if (!task || task.sprintId !== id) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found in sprint' },
        });
        return;
      }

      task.removeFromSprint();
      await taskRepository.update(task);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sprints/:id/bugs
   * Get sprint bugs
   */
  getBugs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const bugRepository = new BugRepository();
      const bugs = await bugRepository.findByWorkspace(sprint.workspaceId, { sprintId: id });

      res.json({
        success: true,
        data: bugs.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          status: b.status,
          severity: b.severity,
          assigneeId: b.assigneeId,
          reporterId: b.reporterId,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * POST /sprints/:id/bugs
   * Add bug to sprint
   */
  addBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { bugId } = req.body;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const bugRepository = new BugRepository();
      const bug = await bugRepository.findById(bugId);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.addToSprint(id);
      await bugRepository.update(bug);

      res.status(201).json({
        success: true,
        message: 'Bug added to sprint',
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /sprints/:id/metrics
   * Get sprint metrics
   */
  getMetrics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const metrics = await this.getSprintMetrics.execute(id);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  };

  removeBug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, bugId } = req.params;

      const bugRepository = new BugRepository();
      const bug = await bugRepository.findById(bugId);
      if (!bug || bug.sprintId !== id) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found in sprint' },
        });
        return;
      }

      bug.removeFromSprint();
      await bugRepository.update(bug);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /sprints/:id/retrospective
   * Get sprint retrospective
   */
  getRetrospective = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const retro = this.retrospectives.get(id);

      res.json({
        success: true,
        data: retro
          ? {
              wentWell: retro.wentWell,
              needsImprovement: retro.needsImprovement,
              actionItems: retro.actionItems,
            }
          : {
              wentWell: [],
              needsImprovement: [],
              actionItems: [],
            },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /sprints/:id/retrospective
   * Save sprint retrospective
   */
  saveRetrospective = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { wentWell, needsImprovement, actionItems } = req.body;

      const sprint = await this.sprintRepository.findById(id);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      // Validate input
      if (
        !Array.isArray(wentWell) ||
        !Array.isArray(needsImprovement) ||
        !Array.isArray(actionItems)
      ) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'All fields must be arrays' },
        });
        return;
      }

      const now = new Date();
      const existing = this.retrospectives.get(id);

      this.retrospectives.set(id, {
        sprintId: id,
        wentWell,
        needsImprovement,
        actionItems,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      });

      res.json({
        success: true,
        message: 'Retrospective saved',
      });
    } catch (error) {
      next(error);
    }
  };
}
