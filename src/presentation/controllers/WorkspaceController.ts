import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import { successResponse } from '@shared/utils/response';
import { NotFoundError, ConflictError } from '@shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class WorkspaceController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspaces = await WorkspaceModel.findAll({
        where: { ownerId: req.user!.userId },
      });

      res.json(
        successResponse(
          workspaces.map(w => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            logo_url: w.logoUrl,
            role: 'owner',
            member_count: 1, // Would be calculated with joins
            subscription_plan: w.subscriptionPlan,
            created_at: w.createdAt,
          }))
        )
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, slug } = req.body;

      let workspaceSlug = slug;
      if (!workspaceSlug) {
        workspaceSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Check if slug exists
      const existing = await WorkspaceModel.findOne({
        where: { slug: workspaceSlug },
      });

      if (existing) {
        throw new ConflictError('Workspace slug already taken', 'SLUG_EXISTS');
      }

      const workspace = await WorkspaceModel.create({
        id: uuidv4(),
        name,
        slug: workspaceSlug,
        ownerId: req.user!.userId,
      });

      res.status(201).json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          owner_id: workspace.ownerId,
          subscription_plan: workspace.subscriptionPlan,
          settings: workspace.settings,
          created_at: workspace.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      res.json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          owner_id: workspace.ownerId,
          subscription_plan: workspace.subscriptionPlan,
          subscription_status: workspace.subscriptionStatus,
          settings: workspace.settings,
          stats: {
            member_count: 1,
            product_count: 0,
            active_features: 0,
            active_sprints: 0,
          },
          created_at: workspace.createdAt,
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      await workspace.update(req.body);

      res.json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          settings: workspace.settings,
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      await workspace.destroy();

      res.json(successResponse({ message: 'Workspace deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Placeholder - would need to implement WorkspaceMember model
      res.json(successResponse([]));
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder
      res.json(successResponse({ message: 'Member role updated' }));
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder
      res.json(successResponse({ message: 'Member removed' }));
    } catch (error) {
      next(error);
    }
  };

  inviteMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder
      res.status(201).json(
        successResponse({
          id: uuidv4(),
          email: req.body.email,
          role: req.body.role,
          status: 'pending',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listInvites = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Placeholder
      res.json(successResponse([]));
    } catch (error) {
      next(error);
    }
  };

  cancelInvite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder
      res.json(successResponse({ message: 'Invitation cancelled' }));
    } catch (error) {
      next(error);
    }
  };

  acceptInvite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Placeholder
      res.json(
        successResponse({
          workspace: { id: uuidv4(), name: 'Workspace', slug: 'workspace' },
          role: 'member',
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
