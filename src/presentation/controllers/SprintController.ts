import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateSprintUseCase } from '@application/use-cases/sprint/CreateSprintUseCase';
import { GetSprintsUseCase } from '@application/use-cases/sprint/GetSprintsUseCase';
import { StartSprintUseCase } from '@application/use-cases/sprint/StartSprintUseCase';
import { CompleteSprintUseCase } from '@application/use-cases/sprint/CompleteSprintUseCase';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { SprintModel } from '@infrastructure/database/models/SprintModel';
import { FeatureModel } from '@infrastructure/database/models/FeatureModel';
import { TaskModel } from '@infrastructure/database/models/TaskModel';
import { BugModel } from '@infrastructure/database/models/BugModel';
import { NotFoundError, ValidationError } from '@shared/errors/AppError';
import { ItemStatus } from '@shared/types';

export class SprintController {
  private createSprintUseCase: CreateSprintUseCase;
  private getSprintsUseCase: GetSprintsUseCase;
  private startSprintUseCase: StartSprintUseCase;
  private completeSprintUseCase: CompleteSprintUseCase;
  private sprintRepository: SprintRepository;

  constructor() {
    this.sprintRepository = new SprintRepository();
    this.createSprintUseCase = new CreateSprintUseCase(this.sprintRepository);
    this.getSprintsUseCase = new GetSprintsUseCase(this.sprintRepository);
    this.startSprintUseCase = new StartSprintUseCase(this.sprintRepository);
    this.completeSprintUseCase = new CompleteSprintUseCase(
      this.sprintRepository
    );
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { sprints, total } = await this.getSprintsUseCase.execute(
        workspaceId,
        filters,
        Number(page),
        Number(limit)
      );

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const meta = getPaginationMeta(p, l, total);

      res.json(successResponse(sprints, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const sprint = await this.createSprintUseCase.execute(
        req.body,
        workspaceId,
        req.user!.userId
      );
      res.status(201).json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await SprintModel.findByPk(req.params.id, {
        include: ['product', 'creator', 'features', 'tasks'],
      });

      if (!sprint) {
        throw new NotFoundError('Sprint not found');
      }

      // Calculate stats
      const features = await FeatureModel.findAll({
        where: { sprintId: sprint.id },
      });

      const tasks = await TaskModel.findAll({
        where: { sprintId: sprint.id },
      });

      const bugs = await BugModel.findAll({
        where: { sprintId: sprint.id },
      });

      const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(sprint.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(sprint.endDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      res.json(
        successResponse({
          id: sprint.id,
          workspace_id: sprint.workspaceId,
          name: sprint.name,
          goal: sprint.goal,
          status: sprint.status,
          start_date: sprint.startDate,
          end_date: sprint.endDate,
          product: sprint.product
            ? {
                id: sprint.product.id,
                name: sprint.product.name,
                color: sprint.product.color,
              }
            : null,
          capacity_points: sprint.capacityPoints,
          committed_points: sprint.completedPoints,
          completed_points: sprint.completedPoints,
          velocity: sprint.velocity,
          progress_percentage:
            sprint.capacityPoints > 0
              ? Math.round(
                  (sprint.completedPoints / sprint.capacityPoints) * 100
                )
              : 0,
          days_remaining: daysRemaining,
          days_elapsed: daysElapsed,
          items: {
            features: features.map(f => ({
              id: f.id,
              title: f.title,
              status: f.status,
              story_points: f.storyPoints,
            })),
            tasks: tasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              story_points: t.storyPoints,
            })),
            bugs: bugs.map(b => ({
              id: b.id,
              title: b.title,
              status: b.status,
              severity: b.severity,
            })),
          },
          item_counts: {
            features: {
              total: features.length,
              done: features.filter(f => f.status === ItemStatus.DONE).length,
            },
            tasks: {
              total: tasks.length,
              done: tasks.filter(t => t.status === ItemStatus.DONE).length,
            },
            bugs: {
              total: bugs.length,
              done: bugs.filter(b => b.status === ItemStatus.DONE).length,
            },
          },
          created_by: sprint.creator
            ? {
                id: sprint.creator.id,
                full_name: sprint.creator.fullName,
              }
            : null,
          created_at: sprint.createdAt,
          updated_at: sprint.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.sprintRepository.update(
        req.params.id,
        req.body
      );
      res.json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { move_items_to } = req.query;

      if (move_items_to) {
        // Move items to another sprint
        await FeatureModel.update(
          { sprintId: move_items_to as string },
          { where: { sprintId: req.params.id } }
        );
        await TaskModel.update(
          { sprintId: move_items_to as string },
          { where: { sprintId: req.params.id } }
        );
        await BugModel.update(
          { sprintId: move_items_to as string },
          { where: { sprintId: req.params.id } }
        );
      }

      await this.sprintRepository.delete(req.params.id);

      res.json(
        successResponse({
          message: 'Sprint deleted successfully',
          ...(move_items_to && {
            items_moved: 0, // Would need to count
            moved_to_sprint: move_items_to,
          }),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  start = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.startSprintUseCase.execute(req.params.id);
      res.json(
        successResponse({
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          started_at: sprint.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { velocity, move_incomplete_to, notes } = req.body;

      const sprint = await this.completeSprintUseCase.execute(
        req.params.id,
        velocity || 0
      );

      // Move incomplete items if specified
      if (move_incomplete_to) {
        await FeatureModel.update(
          { sprintId: move_incomplete_to },
          {
            where: {
              sprintId: req.params.id,
              status: { $ne: ItemStatus.DONE },
            },
          }
        );
        await TaskModel.update(
          { sprintId: move_incomplete_to },
          {
            where: {
              sprintId: req.params.id,
              status: { $ne: ItemStatus.DONE },
            },
          }
        );
      }

      const completedItems = await Promise.all([
        FeatureModel.count({
          where: { sprintId: req.params.id, status: ItemStatus.DONE },
        }),
        TaskModel.count({
          where: { sprintId: req.params.id, status: ItemStatus.DONE },
        }),
      ]);

      const incompleteItems = await Promise.all([
        FeatureModel.count({
          where: { sprintId: req.params.id, status: { $ne: ItemStatus.DONE } },
        }),
        TaskModel.count({
          where: { sprintId: req.params.id, status: { $ne: ItemStatus.DONE } },
        }),
      ]);

      res.json(
        successResponse({
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          completed_at: sprint.updatedAt,
          summary: {
            committed_points: sprint.capacityPoints || 0,
            completed_points: sprint.completedPoints,
            velocity: sprint.velocity,
            completion_rate:
              sprint.capacityPoints > 0
                ? (sprint.completedPoints / sprint.capacityPoints) * 100
                : 0,
            items_completed: completedItems[0] + completedItems[1],
            items_incomplete: incompleteItems[0] + incompleteItems[1],
            items_moved: move_incomplete_to
              ? incompleteItems[0] + incompleteItems[1]
              : 0,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getBurndown = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await SprintModel.findByPk(req.params.id);

      if (!sprint) {
        throw new NotFoundError('Sprint not found');
      }

      const totalPoints = sprint.capacityPoints || 0;
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);

      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Generate ideal burndown
      const idealBurndown = [];
      const pointsPerDay = totalPoints / days;

      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        idealBurndown.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, totalPoints - pointsPerDay * i),
        });
      }

      // Generate actual burndown (simplified - would need task completion tracking)
      const actualBurndown = [
        {
          date: startDate.toISOString().split('T')[0],
          value: totalPoints,
          completed: 0,
        },
      ];

      res.json(
        successResponse({
          sprint_id: sprint.id,
          total_points: totalPoints,
          remaining: totalPoints - sprint.completedPoints,
          ideal_burndown: idealBurndown,
          actual_burndown: actualBurndown,
          scope_changes: [],
          projection: {
            on_track: sprint.completedPoints >= totalPoints * 0.5,
            estimated_completion: endDate.toISOString().split('T')[0],
            confidence: 85,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type, status, assignee_id } = req.query;

      const where: any = { sprintId: id };
      if (status) where.status = status;
      if (assignee_id) where.assigneeId = assignee_id;

      let features = [];
      let tasks = [];
      let bugs = [];

      if (!type || type === 'feature') {
        features = await FeatureModel.findAll({
          where,
          include: ['assignee'],
        });
      }

      if (!type || type === 'task') {
        tasks = await TaskModel.findAll({
          where,
          include: ['assignee', 'feature'],
        });
      }

      if (!type || type === 'bug') {
        bugs = await BugModel.findAll({
          where,
          include: ['assignee'],
        });
      }

      res.json(
        successResponse({
          features: features.map(f => ({
            id: f.id,
            title: f.title,
            status: f.status,
            priority: f.priority,
            story_points: f.storyPoints,
            assignee: f.assignee
              ? {
                  id: f.assignee.id,
                  full_name: f.assignee.fullName,
                }
              : null,
          })),
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            story_points: t.storyPoints,
            feature_id: t.featureId,
            assignee: t.assignee
              ? {
                  id: t.assignee.id,
                  full_name: t.assignee.fullName,
                }
              : null,
          })),
          bugs: bugs.map(b => ({
            id: b.id,
            title: b.title,
            status: b.status,
            severity: b.severity,
            priority: b.priority,
            assignee: b.assignee
              ? {
                  id: b.assignee.id,
                  full_name: b.assignee.fullName,
                }
              : null,
          })),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  addItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { items } = req.body;

      const sprint = await SprintModel.findByPk(id);
      if (!sprint) {
        throw new NotFoundError('Sprint not found');
      }

      let addedCount = 0;
      let totalPoints = 0;

      for (const item of items) {
        if (item.type === 'feature') {
          await FeatureModel.update(
            { sprintId: id },
            { where: { id: item.id } }
          );
          const feature = await FeatureModel.findByPk(item.id);
          totalPoints += feature?.storyPoints || 0;
        } else if (item.type === 'task') {
          await TaskModel.update({ sprintId: id }, { where: { id: item.id } });
          const task = await TaskModel.findByPk(item.id);
          totalPoints += task?.storyPoints || 0;
        } else if (item.type === 'bug') {
          await BugModel.update({ sprintId: id }, { where: { id: item.id } });
        }
        addedCount++;
      }

      const committedPoints = (sprint.capacityPoints || 0) + totalPoints;

      res.json(
        successResponse({
          added: addedCount,
          committed_points: committedPoints,
          capacity_points: sprint.capacityPoints,
          over_capacity: committedPoints > (sprint.capacityPoints || 0),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id, itemId } = req.params;
      const { type } = req.query;

      if (!type) {
        throw new ValidationError('Item type is required');
      }

      if (type === 'feature') {
        await FeatureModel.update(
          { sprintId: null },
          { where: { id: itemId } }
        );
      } else if (type === 'task') {
        await TaskModel.update({ sprintId: null }, { where: { id: itemId } });
      } else if (type === 'bug') {
        await BugModel.update({ sprintId: null }, { where: { id: itemId } });
      }

      const sprint = await SprintModel.findByPk(id);

      res.json(
        successResponse({
          message: 'Item removed from sprint',
          data: {
            committed_points: sprint?.completedPoints || 0,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getRetrospective = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sprint = await SprintModel.findByPk(req.params.id);

      if (!sprint) {
        throw new NotFoundError('Sprint not found');
      }

      res.json(
        successResponse({
          sprint_id: sprint.id,
          ...(sprint.retrospective || {
            went_well: [],
            needs_improvement: [],
            action_items: [],
            team_mood: null,
          }),
          created_at: sprint.updatedAt,
          updated_at: sprint.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  saveRetrospective = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sprint = await SprintModel.findByPk(req.params.id);

      if (!sprint) {
        throw new NotFoundError('Sprint not found');
      }

      sprint.retrospective = req.body;
      await sprint.save();

      res.json(
        successResponse({
          sprint_id: sprint.id,
          saved_at: sprint.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
