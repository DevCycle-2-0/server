import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { FeatureModel } from '@infrastructure/database/models/FeatureModel';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { NotFoundError } from '@shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class FeatureController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const offset = (p - 1) * l;

      const where: any = { workspaceId };

      if (filters.productId) where.productId = filters.productId;
      if (filters.sprintId) where.sprintId = filters.sprintId;
      if (filters.stage) where.stage = filters.stage;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.assigneeId) where.assigneeId = filters.assigneeId;
      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }

      const { rows, count } = await FeatureModel.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [['createdAt', 'DESC']],
        include: ['product', 'sprint', 'assignee', 'reporter'],
      });

      const meta = getPaginationMeta(p, l, count);

      res.json(
        successResponse(
          rows.map(feature => ({
            id: feature.id,
            title: feature.title,
            description: feature.description,
            stage: feature.stage,
            priority: feature.priority,
            status: feature.status,
            votes: feature.votes,
            has_voted: false,
            story_points: feature.storyPoints,
            product: feature.product
              ? {
                  id: feature.product.id,
                  name: feature.product.name,
                  color: feature.product.color,
                }
              : null,
            sprint: feature.sprint
              ? {
                  id: feature.sprint.id,
                  name: feature.sprint.name,
                }
              : null,
            assignee: feature.assignee
              ? {
                  id: feature.assignee.id,
                  full_name: feature.assignee.fullName,
                  avatar_url: feature.assignee.avatarUrl,
                }
              : null,
            reporter: feature.reporter
              ? {
                  id: feature.reporter.id,
                  full_name: feature.reporter.fullName,
                }
              : null,
            tags: feature.tags,
            task_count: 0,
            tasks_completed: 0,
            due_date: feature.dueDate,
            created_at: feature.createdAt,
            updated_at: feature.updatedAt,
          })),
          meta
        )
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;

      const feature = await FeatureModel.create({
        id: uuidv4(),
        workspaceId,
        ...req.body,
        reporterId: req.user!.userId,
      });

      res.status(201).json(
        successResponse({
          id: feature.id,
          workspace_id: feature.workspaceId,
          title: feature.title,
          description: feature.description,
          stage: feature.stage,
          priority: feature.priority,
          status: feature.status,
          votes: feature.votes,
          story_points: feature.storyPoints,
          reporter: {
            id: req.user!.userId,
            full_name: 'User',
          },
          tags: feature.tags,
          due_date: feature.dueDate,
          created_at: feature.createdAt,
          updated_at: feature.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id, {
        include: ['product', 'sprint', 'assignee', 'reporter', 'tasks'],
      });

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      res.json(
        successResponse({
          id: feature.id,
          workspace_id: feature.workspaceId,
          title: feature.title,
          description: feature.description,
          stage: feature.stage,
          priority: feature.priority,
          status: feature.status,
          votes: feature.votes,
          has_voted: false,
          story_points: feature.storyPoints,
          product: feature.product
            ? {
                id: feature.product.id,
                name: feature.product.name,
                color: feature.product.color,
              }
            : null,
          sprint: feature.sprint
            ? {
                id: feature.sprint.id,
                name: feature.sprint.name,
                start_date: feature.sprint.startDate,
                end_date: feature.sprint.endDate,
              }
            : null,
          assignee: feature.assignee
            ? {
                id: feature.assignee.id,
                full_name: feature.assignee.fullName,
                avatar_url: feature.assignee.avatarUrl,
                email: feature.assignee.email,
              }
            : null,
          reporter: feature.reporter
            ? {
                id: feature.reporter.id,
                full_name: feature.reporter.fullName,
                avatar_url: feature.reporter.avatarUrl,
              }
            : null,
          tags: feature.tags,
          attachments: feature.attachments,
          custom_fields: feature.customFields,
          tasks: {
            total: feature.tasks?.length || 0,
            completed: 0,
            in_progress: 0,
            todo: 0,
          },
          due_date: feature.dueDate,
          completed_at: feature.completedAt,
          created_at: feature.createdAt,
          updated_at: feature.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id);

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      await feature.update(req.body);

      res.json(
        successResponse({
          id: feature.id,
          title: feature.title,
          description: feature.description,
          priority: feature.priority,
          story_points: feature.storyPoints,
          tags: feature.tags,
          due_date: feature.dueDate,
          updated_at: feature.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id);

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      await feature.destroy();

      res.json(successResponse({ message: 'Feature deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  vote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id);

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      feature.votes++;
      await feature.save();

      res.json(
        successResponse({
          feature_id: feature.id,
          votes: feature.votes,
          has_voted: true,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  removeVote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id);

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      if (feature.votes > 0) {
        feature.votes--;
        await feature.save();
      }

      res.json(
        successResponse({
          feature_id: feature.id,
          votes: feature.votes,
          has_voted: false,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  changeStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const feature = await FeatureModel.findByPk(req.params.id);

      if (!feature) {
        throw new NotFoundError('Feature not found');
      }

      const previousStage = feature.stage;
      feature.stage = req.body.stage;
      await feature.save();

      res.json(
        successResponse({
          id: feature.id,
          stage: feature.stage,
          previous_stage: previousStage,
          stage_changed_at: feature.updatedAt,
          stage_changed_by: {
            id: req.user!.userId,
            full_name: 'User',
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
