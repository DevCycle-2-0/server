// src/infrastructure/http/controllers/WorkspacesController.ts
import { Response, NextFunction } from 'express';
import { WorkspaceRepository } from '@infrastructure/database/repositories/WorkspaceRepository';
import { Workspace } from '@core/domain/entities/Workspace';
import { AuthRequest } from '../middleware/auth.middleware';

export class WorkspacesController {
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, slug } = req.body;
      const ownerId = req.user!.sub;

      const workspace = Workspace.create(name, ownerId);
      await this.workspaceRepository.save(workspace);

      res.status(201).json({
        success: true,
        data: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          ownerId: workspace.ownerId,
          settings: workspace.settings,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not assigned to workspace' },
        });
        return;
      }

      const workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          ownerId: workspace.ownerId,
          settings: workspace.settings,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, settings } = req.body;

      const workspace = await this.workspaceRepository.findById(id);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
        return;
      }

      if (name) workspace.updateName(name);
      if (settings) workspace.updateSettings(settings);

      await this.workspaceRepository.update(workspace);

      res.json({ success: true, message: 'Workspace updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.workspaceRepository.delete(id);
      res.json({ success: true, message: 'Workspace deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
