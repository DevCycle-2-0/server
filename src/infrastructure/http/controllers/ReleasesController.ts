// src/infrastructure/http/controllers/ReleasesController.ts
import { Response, NextFunction } from 'express';
import { Release } from '@core/domain/entities/Release';
import { ReleaseRepository } from '@infrastructure/database/repositories/ReleaseRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class ReleasesController {
  private releaseRepository: ReleaseRepository;

  constructor() {
    this.releaseRepository = new ReleaseRepository();
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

      const { productId, status } = req.query;

      let releases;
      if (productId) {
        releases = await this.releaseRepository.findByProduct(productId as string);
        if (status) {
          releases = releases.filter((r) => r.status === status);
        }
      } else {
        releases = await this.releaseRepository.findByWorkspace(workspaceId);
      }

      res.json({
        success: true,
        data: releases.map((r) => ({
          id: r.id,
          workspaceId: r.workspaceId,
          productId: r.productId,
          version: r.version,
          name: r.name,
          description: r.description,
          status: r.status,
          releaseNotes: r.releaseNotes,
          targetDate: r.targetDate,
          releaseDate: r.releaseDate,
          createdBy: r.createdBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: release.id,
          workspaceId: release.workspaceId,
          productId: release.productId,
          version: release.version,
          name: release.name,
          description: release.description,
          status: release.status,
          releaseNotes: release.releaseNotes,
          targetDate: release.targetDate,
          releaseDate: release.releaseDate,
          createdBy: release.createdBy,
          createdAt: release.createdAt,
          updatedAt: release.updatedAt,
        },
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

      const { productId, version, name, description, targetDate, releaseNotes } = req.body;
      const createdBy = req.user!.sub;

      const release = Release.create(workspaceId, productId, version, name, createdBy, description);

      if (targetDate) {
        release.update({ targetDate: new Date(targetDate) });
      }

      if (releaseNotes) {
        release.update({ releaseNotes });
      }

      await this.releaseRepository.save(release);

      res.status(201).json({
        success: true,
        data: {
          releaseId: release.id,
          version: release.version,
          name: release.name,
          status: release.status,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, releaseNotes, targetDate } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      release.update({ name, description, releaseNotes, targetDate });
      await this.releaseRepository.update(release);

      res.json({ success: true, message: 'Release updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      if (release.isReleased()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot delete a released version',
          },
        });
        return;
      }

      await this.releaseRepository.delete(id);

      res.json({ success: true, message: 'Release deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  deploy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      release.deploy();
      await this.releaseRepository.update(release);

      res.json({
        success: true,
        data: {
          id: release.id,
          status: release.status,
          releaseDate: release.releaseDate,
        },
        message: 'Release deployed to production successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  rollback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      release.rollback();
      await this.releaseRepository.update(release);

      res.json({
        success: true,
        data: {
          id: release.id,
          status: release.status,
        },
        message: 'Release rolled back successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getDeployments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Mock deployment history - in real implementation, you'd have a Deployment model
      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}
