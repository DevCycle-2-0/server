import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateReleaseUseCase } from '@application/use-cases/release/CreateReleaseUseCase';
import { GetReleasesUseCase } from '@application/use-cases/release/GetReleasesUseCase';
import { PublishReleaseUseCase } from '@application/use-cases/release/PublishReleaseUseCase';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { ReleaseRepository } from '@infrastructure/database/repositories/ReleaseRepository';
import { ReleaseModel } from '@infrastructure/database/models/ReleaseModel';
import { ReleaseFeatureModel } from '@infrastructure/database/models/ReleaseFeatureModel';
import { FeatureModel } from '@infrastructure/database/models/FeatureModel';
import { BugModel } from '@infrastructure/database/models/BugModel';
import { NotFoundError } from '@shared/errors/AppError';
import { ItemStatus } from '@shared/types';

export class ReleaseController {
  private createReleaseUseCase: CreateReleaseUseCase;
  private getReleasesUseCase: GetReleasesUseCase;
  private publishReleaseUseCase: PublishReleaseUseCase;
  private releaseRepository: ReleaseRepository;

  constructor() {
    this.releaseRepository = new ReleaseRepository();
    this.createReleaseUseCase = new CreateReleaseUseCase(
      this.releaseRepository
    );
    this.getReleasesUseCase = new GetReleasesUseCase(this.releaseRepository);
    this.publishReleaseUseCase = new PublishReleaseUseCase(
      this.releaseRepository
    );
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { releases, total } = await this.getReleasesUseCase.execute(
        workspaceId,
        filters,
        Number(page),
        Number(limit)
      );

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const meta = getPaginationMeta(p, l, total);

      res.json(successResponse(releases, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const release = await this.createReleaseUseCase.execute(
        req.body,
        workspaceId,
        req.user!.userId
      );
      res.status(201).json(successResponse(release));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const release = await ReleaseModel.findByPk(req.params.id, {
        include: ['product', 'creator', 'releaser'],
      });

      if (!release) {
        throw new NotFoundError('Release not found');
      }

      // Get features in release
      const releaseFeatures = await ReleaseFeatureModel.findAll({
        where: { releaseId: release.id },
        include: ['feature'],
      });

      const featureIds = releaseFeatures.map(rf => rf.featureId);
      const features = await FeatureModel.findAll({
        where: { id: featureIds },
      });

      const bugsFixed = await BugModel.count({
        where: {
          featureId: featureIds,
          status: ItemStatus.DONE,
        },
      });

      res.json(
        successResponse({
          id: release.id,
          workspace_id: release.workspaceId,
          version: release.version,
          name: release.name,
          description: release.description,
          status: release.status,
          release_type: release.releaseType,
          product: release.product
            ? {
                id: release.product.id,
                name: release.product.name,
                color: release.product.color,
              }
            : null,
          target_date: release.targetDate,
          released_at: release.releasedAt,
          released_by: release.releaser
            ? {
                id: release.releaser.id,
                full_name: release.releaser.fullName,
              }
            : null,
          features: features.map(f => ({
            id: f.id,
            title: f.title,
            stage: f.stage,
            status: f.status,
          })),
          feature_summary: {
            total: features.length,
            completed: features.filter(f => f.status === ItemStatus.DONE)
              .length,
            in_progress: features.filter(
              f => f.status === ItemStatus.IN_PROGRESS
            ).length,
            by_stage: features.reduce((acc: any, f) => {
              acc[f.stage] = (acc[f.stage] || 0) + 1;
              return acc;
            }, {}),
          },
          bugs_fixed: [
            // Would need to implement bug tracking for releases
          ],
          pipeline: {
            config: release.pipelineConfig,
            current_stage: null,
            history: [],
          },
          release_notes: {
            summary: release.releaseNotes || '',
            highlights: [],
            breaking_changes: [],
            deprecations: [],
          },
          rollback_reason: release.rollbackReason,
          rolled_back_at: release.rolledBackAt,
          created_by: release.creator
            ? {
                id: release.creator.id,
                full_name: release.creator.fullName,
              }
            : null,
          created_at: release.createdAt,
          updated_at: release.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const release = await this.releaseRepository.update(
        req.params.id,
        req.body
      );
      res.json(successResponse(release));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.releaseRepository.delete(req.params.id);
      res.json(successResponse({ message: 'Release deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  publish = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const release = await this.publishReleaseUseCase.execute(
        req.params.id,
        req.user!.userId
      );

      res.json(
        successResponse({
          id: release.id,
          version: release.version,
          status: release.status,
          released_at: release.releasedAt,
          released_by: {
            id: req.user!.userId,
            full_name: 'User',
          },
          pipeline: {
            current_stage: 'production',
            completed_at: release.releasedAt,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  rollback = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { reason, rollback_to } = req.body;
      const release = await this.releaseRepository.findById(req.params.id);

      if (!release) {
        throw new NotFoundError('Release not found');
      }

      release.rollback(reason);
      const updated = await this.releaseRepository.update(
        req.params.id,
        release
      );

      res.json(
        successResponse({
          id: updated.id,
          version: updated.version,
          status: updated.status,
          rollback_reason: updated.rollbackReason,
          rolled_back_at: updated.rolledBackAt,
          rolled_back_by: {
            id: req.user!.userId,
            full_name: 'User',
          },
          ...(rollback_to && {
            rolled_back_to: {
              id: rollback_to,
              version: '0.0.0', // Would need to fetch
            },
          }),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getFeatures = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const releaseFeatures = await ReleaseFeatureModel.findAll({
        where: { releaseId: req.params.id },
        include: [
          {
            model: FeatureModel,
            as: 'feature',
            include: ['assignee'],
          },
        ],
      });

      res.json(
        successResponse(
          releaseFeatures.map(rf => ({
            id: rf.feature.id,
            title: rf.feature.title,
            description: rf.feature.description,
            stage: rf.feature.stage,
            status: rf.feature.status,
            priority: rf.feature.priority,
            story_points: rf.feature.storyPoints,
            assignee: rf.feature.assignee
              ? {
                  id: rf.feature.assignee.id,
                  full_name: rf.feature.assignee.fullName,
                }
              : null,
            added_at: rf.createdAt,
          }))
        )
      );
    } catch (error) {
      next(error);
    }
  };

  addFeatures = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { feature_ids } = req.body;

      for (const featureId of feature_ids) {
        await ReleaseFeatureModel.findOrCreate({
          where: {
            releaseId: req.params.id,
            featureId,
          },
          defaults: {
            id: require('uuid').v4(),
            releaseId: req.params.id,
            featureId,
          },
        });
      }

      const featureCount = await ReleaseFeatureModel.count({
        where: { releaseId: req.params.id },
      });

      res.json(
        successResponse({
          added: feature_ids.length,
          feature_count: featureCount,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  removeFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, featureId } = req.params;

      await ReleaseFeatureModel.destroy({
        where: { releaseId: id, featureId },
      });

      const featureCount = await ReleaseFeatureModel.count({
        where: { releaseId: id },
      });

      res.json(
        successResponse({
          message: 'Feature removed from release',
          data: { feature_count: featureCount },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const release = await ReleaseModel.findByPk(req.params.id);

      if (!release) {
        throw new NotFoundError('Release not found');
      }

      // Get features and bugs
      const releaseFeatures = await ReleaseFeatureModel.findAll({
        where: { releaseId: release.id },
        include: ['feature'],
      });

      res.json(
        successResponse({
          release_id: release.id,
          version: release.version,
          summary: release.releaseNotes || '',
          highlights: [],
          features: releaseFeatures.map(rf => ({
            title: rf.feature.title,
            description: rf.feature.description,
          })),
          bug_fixes: [],
          breaking_changes: [],
          deprecations: [],
          known_issues: [],
          updated_at: release.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const release = await ReleaseModel.findByPk(req.params.id);

      if (!release) {
        throw new NotFoundError('Release not found');
      }

      const { summary, highlights, breaking_changes, deprecations } = req.body;

      // Store as JSON in releaseNotes or use a separate field
      release.releaseNotes = JSON.stringify({
        summary,
        highlights,
        breaking_changes,
        deprecations,
      });

      await release.save();

      res.json(
        successResponse({
          release_id: release.id,
          updated_at: release.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getChangelog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const release = await ReleaseModel.findByPk(req.params.id);

      if (!release) {
        throw new NotFoundError('Release not found');
      }

      const releaseFeatures = await ReleaseFeatureModel.findAll({
        where: { releaseId: release.id },
        include: ['feature'],
      });

      let notes: any = {};
      try {
        notes = JSON.parse(release.releaseNotes || '{}');
      } catch {
        notes = { summary: release.releaseNotes };
      }

      res.json(
        successResponse({
          version: release.version,
          name: release.name,
          released_at: release.releasedAt,
          summary: notes.summary || '',
          highlights: notes.highlights || [],
          features: releaseFeatures.map(rf => ({
            title: rf.feature.title,
            description: rf.feature.description,
          })),
          bug_fixes: [],
          breaking_changes: notes.breaking_changes || [],
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
