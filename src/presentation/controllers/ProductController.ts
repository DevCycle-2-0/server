import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ProductModel } from '@infrastructure/database/models/ProductModel';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { NotFoundError } from '@shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class ProductController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit } = req.query;

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const offset = (p - 1) * l;

      const { rows, count } = await ProductModel.findAndCountAll({
        where: { workspaceId },
        limit: l,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const meta = getPaginationMeta(p, l, count);

      res.json(
        successResponse(
          rows.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            logo_url: product.logoUrl,
            color: product.color,
            status: product.status,
            stats: {
              feature_count: 0,
              active_sprint_count: 0,
              open_bug_count: 0,
              completion_percentage: 0,
            },
            created_by: {
              id: product.createdBy,
              full_name: 'User',
            },
            created_at: product.createdAt,
            updated_at: product.updatedAt,
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
      const { name, description, color, settings } = req.body;

      const product = await ProductModel.create({
        id: uuidv4(),
        workspaceId,
        name,
        description,
        color: color || '#6366F1',
        settings: settings || {},
        createdBy: req.user!.userId,
      });

      res.status(201).json(
        successResponse({
          id: product.id,
          workspace_id: product.workspaceId,
          name: product.name,
          description: product.description,
          logo_url: product.logoUrl,
          color: product.color,
          status: product.status,
          settings: product.settings,
          created_by: {
            id: product.createdBy,
            full_name: 'User',
          },
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByPk(req.params.id);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json(
        successResponse({
          id: product.id,
          workspace_id: product.workspaceId,
          name: product.name,
          description: product.description,
          logo_url: product.logoUrl,
          color: product.color,
          status: product.status,
          settings: product.settings,
          stats: {
            feature_count: 0,
            features_by_stage: {},
            task_count: 0,
            tasks_completed: 0,
            bug_count: 0,
            bugs_resolved: 0,
            sprint_count: 0,
            release_count: 0,
          },
          created_by: {
            id: product.createdBy,
            full_name: 'User',
          },
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByPk(req.params.id);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      await product.update(req.body);

      res.json(
        successResponse({
          id: product.id,
          name: product.name,
          description: product.description,
          color: product.color,
          status: product.status,
          settings: product.settings,
          updated_at: product.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByPk(req.params.id);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      await product.destroy();

      res.json(successResponse({ message: 'Product deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Placeholder for product statistics
      res.json(
        successResponse({
          overview: {
            total_features: 0,
            completed_features: 0,
            in_progress_features: 0,
            backlog_features: 0,
            completion_rate: 0,
          },
          velocity: {
            current: 0,
            average: 0,
            trend: 'stable',
            history: [],
          },
          bugs: {
            total: 0,
            open: 0,
            by_severity: {},
            avg_resolution_days: 0,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
