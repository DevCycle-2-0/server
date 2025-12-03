import { Response, NextFunction } from 'express';
import { CreateFeature } from '@core/application/use-cases/features/CreateFeature';
import { VoteFeature } from '@core/application/use-cases/features/VoteFeature';
import { ApproveFeature } from '@core/application/use-cases/features/ApproveFeature';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class FeaturesController {
  private createFeature: CreateFeature;
  private voteFeature: VoteFeature;
  private approveFeature: ApproveFeature;
  private featureRepository: FeatureRepository;

  constructor() {
    this.featureRepository = new FeatureRepository();
    this.createFeature = new CreateFeature(this.featureRepository);
    this.voteFeature = new VoteFeature(this.featureRepository);
    this.approveFeature = new ApproveFeature(this.featureRepository);
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

      const { status, priority, productId, sprintId, assigneeId, limit, offset } = req.query;

      const features = await this.featureRepository.findByWorkspace(workspaceId, {
        status,
        priority,
        productId,
        sprintId,
        assigneeId,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        data: features.map((f) => ({
          id: f.id,
          workspaceId: f.workspaceId,
          productId: f.productId,
          title: f.title,
          description: f.description,
          status: f.status,
          priority: f.priority,
          assigneeId: f.assigneeId,
          sprintId: f.sprintId,
          estimatedHours: f.estimatedHours,
          actualHours: f.actualHours,
          votes: f.votes,
          tags: f.tags,
          completedAt: f.completedAt,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        })),
        pagination: { total: features.length },
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

      const { productId, title, description } = req.body;

      const result = await this.createFeature.execute({
        workspaceId,
        productId,
        title,
        description,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, priority, estimatedHours, tags } = req.body;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.update({ title, description, priority, estimatedHours, tags });
      await this.featureRepository.update(feature);

      res.json({ success: true, message: 'Feature updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  vote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.voteFeature.execute({ featureId: id, userId: req.user!.sub });
      res.json({ success: true, message: 'Vote recorded successfully' });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.approveFeature.execute({ featureId: id });
      res.json({ success: true, message: 'Feature approved successfully' });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.featureRepository.delete(id);
      res.json({ success: true, message: 'Feature deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
