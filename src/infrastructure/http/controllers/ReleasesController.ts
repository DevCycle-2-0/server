// src/infrastructure/http/controllers/ReleasesController.ts
import { Response, NextFunction } from 'express';
import { Release, ReleaseStatus } from '@core/domain/entities/Release';
import { ReleaseRepository } from '@infrastructure/database/repositories/ReleaseRepository';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { AuthRequest } from '../middleware/auth.middleware';

// In-memory storage for advanced features (replace with database models in production)
interface PipelineStage {
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

interface Pipeline {
  build: PipelineStage;
  test: PipelineStage;
  staging: PipelineStage;
  production: PipelineStage;
}

interface RollbackRecord {
  id: string;
  releaseId: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  performedBy: string;
  performedAt: Date;
}

interface ApprovalRecord {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  decidedAt?: Date;
}

export class ReleasesController {
  private releaseRepository: ReleaseRepository;
  private featureRepository: FeatureRepository;
  private bugRepository: BugRepository;

  // In-memory stores (replace with database in production)
  private pipelines: Map<string, Pipeline> = new Map();
  private rollbackHistory: Map<string, RollbackRecord[]> = new Map();
  private linkedFeatures: Map<string, string[]> = new Map();
  private linkedBugfixes: Map<string, string[]> = new Map();
  private approvals: Map<string, ApprovalRecord[]> = new Map();

  constructor() {
    this.releaseRepository = new ReleaseRepository();
    this.featureRepository = new FeatureRepository();
    this.bugRepository = new BugRepository();
  }

  /**
   * GET /releases
   * List releases with pagination, filtering, search
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

      const { page = '1', limit = '10', status, productId, search } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let releases = productId
        ? await this.releaseRepository.findByProduct(productId as string)
        : await this.releaseRepository.findByWorkspace(workspaceId);

      // Apply filters
      if (status) {
        releases = releases.filter((r) => r.status === status);
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        releases = releases.filter(
          (r) =>
            r.name.toLowerCase().includes(searchLower) ||
            r.version.toLowerCase().includes(searchLower) ||
            r.description?.toLowerCase().includes(searchLower)
        );
      }

      // Sort by release date desc
      releases.sort((a, b) => {
        const aDate = a.releaseDate || a.createdAt;
        const bDate = b.releaseDate || b.createdAt;
        return bDate.getTime() - aDate.getTime();
      });

      // Paginate
      const total = releases.length;
      const paginatedReleases = releases.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: paginatedReleases.map((r) => ({
          id: r.id,
          version: r.version,
          name: r.name,
          description: r.description,
          status: r.status,
          productId: r.productId,
          releaseDate: r.releaseDate,
          releaseNotes: r.releaseNotes,
          featureIds: this.linkedFeatures.get(r.id) || [],
          bugfixIds: this.linkedBugfixes.get(r.id) || [],
          pipeline: this.pipelines.get(r.id) || this.createDefaultPipeline(),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
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
   * GET /releases/:id
   * Get single release
   */
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
          version: release.version,
          name: release.name,
          description: release.description,
          status: release.status,
          productId: release.productId,
          workspaceId: release.workspaceId,
          releaseDate: release.releaseDate,
          targetDate: release.targetDate,
          releaseNotes: release.releaseNotes,
          featureIds: this.linkedFeatures.get(id) || [],
          bugfixIds: this.linkedBugfixes.get(id) || [],
          pipeline: this.pipelines.get(id) || this.createDefaultPipeline(),
          createdBy: release.createdBy,
          createdAt: release.createdAt,
          updatedAt: release.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases
   * Create release
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to workspace' },
        });
        return;
      }

      const {
        productId,
        version,
        name,
        description,
        releaseDate,
        releaseNotes,
        featureIds,
        bugfixIds,
      } = req.body;

      const createdBy = req.user!.sub;

      const release = Release.create(workspaceId, productId, version, name, createdBy, description);

      if (releaseDate) {
        release.update({ releaseNotes, targetDate: new Date(releaseDate) });
      }

      await this.releaseRepository.save(release);

      // Link features and bugfixes
      if (featureIds?.length) {
        this.linkedFeatures.set(release.id, featureIds);
      }
      if (bugfixIds?.length) {
        this.linkedBugfixes.set(release.id, bugfixIds);
      }

      // Initialize pipeline
      this.pipelines.set(release.id, this.createDefaultPipeline());

      res.status(201).json({
        success: true,
        data: {
          id: release.id,
          version: release.version,
          name: release.name,
          status: release.status,
          createdAt: release.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /releases/:id
   * Update release
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, releaseNotes, targetDate, releaseDate } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      release.update({
        name,
        description,
        releaseNotes,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      });

      await this.releaseRepository.update(release);

      res.json({
        success: true,
        data: {
          id: release.id,
          name: release.name,
          updatedAt: release.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /releases/:id
   * Delete release
   */
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
          error: { code: 'VALIDATION_ERROR', message: 'Cannot delete released version' },
        });
        return;
      }

      await this.releaseRepository.delete(id);

      // Cleanup
      this.pipelines.delete(id);
      this.linkedFeatures.delete(id);
      this.linkedBugfixes.delete(id);
      this.rollbackHistory.delete(id);
      this.approvals.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /releases/:id/status
   * Update release status
   */
  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      release.changeStatus(status as ReleaseStatus);
      await this.releaseRepository.update(release);

      res.json({
        success: true,
        data: {
          id: release.id,
          status: release.status,
          updatedAt: release.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /releases/:id/pipeline
   * Get pipeline status
   */
  getPipeline = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const pipeline = this.pipelines.get(id) || this.createDefaultPipeline();

      res.json({
        success: true,
        data: pipeline,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/pipeline/:stage/start
   * Start pipeline stage
   */
  startPipelineStage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id, stage } = req.params;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const pipeline = this.pipelines.get(id) || this.createDefaultPipeline();
      const stageKey = stage as keyof Pipeline;

      if (!pipeline[stageKey]) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_STAGE', message: 'Invalid pipeline stage' },
        });
        return;
      }

      pipeline[stageKey] = {
        status: 'running',
        startedAt: new Date(),
      };

      this.pipelines.set(id, pipeline);

      res.json({
        success: true,
        message: 'Pipeline stage started',
        data: pipeline[stageKey],
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/pipeline/:stage/complete
   * Complete pipeline stage
   */
  completePipelineStage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id, stage } = req.params;
      const { success: succeeded, notes } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const pipeline = this.pipelines.get(id) || this.createDefaultPipeline();
      const stageKey = stage as keyof Pipeline;

      if (!pipeline[stageKey]) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_STAGE', message: 'Invalid pipeline stage' },
        });
        return;
      }

      pipeline[stageKey] = {
        ...pipeline[stageKey],
        status: succeeded ? 'completed' : 'failed',
        completedAt: new Date(),
        notes,
      };

      this.pipelines.set(id, pipeline);

      res.json({
        success: true,
        message: 'Pipeline stage completed',
        data: pipeline[stageKey],
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/pipeline/:stage/retry
   * Retry pipeline stage
   */
  retryPipelineStage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id, stage } = req.params;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const pipeline = this.pipelines.get(id) || this.createDefaultPipeline();
      const stageKey = stage as keyof Pipeline;

      if (!pipeline[stageKey]) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_STAGE', message: 'Invalid pipeline stage' },
        });
        return;
      }

      pipeline[stageKey] = {
        status: 'running',
        startedAt: new Date(),
      };

      this.pipelines.set(id, pipeline);

      res.json({
        success: true,
        message: 'Pipeline stage retrying',
        data: pipeline[stageKey],
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/deploy
   * Deploy release
   */
  deploy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { environment } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      if (environment === 'production') {
        release.deploy();
        await this.releaseRepository.update(release);
      }

      res.json({
        success: true,
        message: 'Deployment started',
        data: {
          id: release.id,
          status: release.status,
          releaseDate: release.releaseDate,
          environment,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/rollback
   * Rollback release
   */
  rollback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason, targetVersion } = req.body;
      const performedBy = req.user!.sub;

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

      // Record rollback
      const rollbackRecord: RollbackRecord = {
        id: crypto.randomUUID(),
        releaseId: id,
        fromVersion: release.version,
        toVersion: targetVersion || 'previous',
        reason,
        performedBy,
        performedAt: new Date(),
      };

      const history = this.rollbackHistory.get(id) || [];
      history.push(rollbackRecord);
      this.rollbackHistory.set(id, history);

      res.json({
        success: true,
        data: rollbackRecord,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /releases/:id/rollbacks
   * Get rollback history
   */
  getRollbacks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const history = this.rollbackHistory.get(id) || [];

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /releases/:id/notes
   * Update release notes
   */
  updateNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

      release.update({ releaseNotes: notes });
      await this.releaseRepository.update(release);

      res.json({
        success: true,
        message: 'Release notes updated',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/notes/generate
   * Generate release notes from linked features/bugs
   */
  generateNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

      const featureIds = this.linkedFeatures.get(id) || [];
      const bugfixIds = this.linkedBugfixes.get(id) || [];

      let notes = `## Release ${release.version}\n\n`;

      if (featureIds.length > 0) {
        notes += `### New Features\n`;
        for (const featureId of featureIds) {
          const feature = await this.featureRepository.findById(featureId);
          if (feature) {
            notes += `- ${feature.title}\n`;
          }
        }
        notes += '\n';
      }

      if (bugfixIds.length > 0) {
        notes += `### Bug Fixes\n`;
        for (const bugId of bugfixIds) {
          const bug = await this.bugRepository.findById(bugId);
          if (bug) {
            notes += `- ${bug.title}\n`;
          }
        }
        notes += '\n';
      }

      res.json({
        success: true,
        data: { notes },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /releases/:id/notes/export
   * Export release notes
   */
  exportNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { format = 'markdown' } = req.query;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const notes =
        release.releaseNotes || `# Release ${release.version}\n\nNo release notes available.`;

      if (format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="release-${release.version}.md"`
        );
        res.send(notes);
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'UNSUPPORTED_FORMAT', message: 'Only markdown format supported' },
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/features
   * Link feature to release
   */
  linkFeature = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { featureId } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const feature = await this.featureRepository.findById(featureId);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      const features = this.linkedFeatures.get(id) || [];
      if (!features.includes(featureId)) {
        features.push(featureId);
        this.linkedFeatures.set(id, features);
      }

      res.status(201).json({
        success: true,
        message: 'Feature linked',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /releases/:id/features/:featureId
   * Unlink feature from release
   */
  unlinkFeature = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, featureId } = req.params;

      const features = this.linkedFeatures.get(id) || [];
      const filtered = features.filter((fid) => fid !== featureId);
      this.linkedFeatures.set(id, filtered);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/bugfixes
   * Link bugfix to release
   */
  linkBugfix = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { bugId } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const bug = await this.bugRepository.findById(bugId);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      const bugfixes = this.linkedBugfixes.get(id) || [];
      if (!bugfixes.includes(bugId)) {
        bugfixes.push(bugId);
        this.linkedBugfixes.set(id, bugfixes);
      }

      res.status(201).json({
        success: true,
        message: 'Bug fix linked',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /releases/:id/bugfixes/:bugId
   * Unlink bugfix from release
   */
  unlinkBugfix = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, bugId } = req.params;

      const bugfixes = this.linkedBugfixes.get(id) || [];
      const filtered = bugfixes.filter((bid) => bid !== bugId);
      this.linkedBugfixes.set(id, filtered);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/approval/request
   * Request release approval
   */
  requestApproval = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { approvers } = req.body;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const approvalRecords: ApprovalRecord[] = approvers.map((userId: string) => ({
        userId,
        status: 'pending',
      }));

      this.approvals.set(id, approvalRecords);

      res.json({
        success: true,
        message: 'Approval requested',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/approval/approve
   * Approve release
   */
  approveRelease = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user!.sub;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const approvalRecords = this.approvals.get(id) || [];
      const userApproval = approvalRecords.find((a) => a.userId === userId);

      if (userApproval) {
        userApproval.status = 'approved';
        userApproval.comment = comment;
        userApproval.decidedAt = new Date();
        this.approvals.set(id, approvalRecords);
      }

      res.json({
        success: true,
        message: 'Release approved',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /releases/:id/approval/reject
   * Reject release
   */
  rejectRelease = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!.sub;

      const release = await this.releaseRepository.findById(id);
      if (!release) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Release not found' },
        });
        return;
      }

      const approvalRecords = this.approvals.get(id) || [];
      const userApproval = approvalRecords.find((a) => a.userId === userId);

      if (userApproval) {
        userApproval.status = 'rejected';
        userApproval.comment = reason;
        userApproval.decidedAt = new Date();
        this.approvals.set(id, approvalRecords);
      }

      res.json({
        success: true,
        message: 'Release rejected',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /releases/:id/approval/status
   * Get approval status
   */
  getApprovalStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      const approvalRecords = this.approvals.get(id) || [];
      const approved = approvalRecords.filter((a) => a.status === 'approved').length;

      res.json({
        success: true,
        data: {
          required: approvalRecords.length,
          approved,
          approvers: approvalRecords.map((a) => ({
            userId: a.userId,
            status: a.status,
            comment: a.comment,
            decidedAt: a.decidedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper methods
  private createDefaultPipeline(): Pipeline {
    return {
      build: { status: 'pending' },
      test: { status: 'pending' },
      staging: { status: 'pending' },
      production: { status: 'pending' },
    };
  }

  // Legacy method from original implementation
  getDeployments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      res.json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  };
}
