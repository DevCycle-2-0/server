import { Response, NextFunction } from 'express';
import { CreateFeature } from '@core/application/use-cases/features/CreateFeature';
import { VoteFeature } from '@core/application/use-cases/features/VoteFeature';
import { ApproveFeature } from '@core/application/use-cases/features/ApproveFeature';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { CommentRepository } from '@infrastructure/database/repositories/CommentRepository';
import { AuthRequest } from '../middleware/auth.middleware';
import { FeatureStatus } from '@core/domain/entities/Feature';
import { CommentableType } from '@core/domain/entities/Comment';

export class FeaturesController {
  private createFeature: CreateFeature;
  private voteFeature: VoteFeature;
  private approveFeature: ApproveFeature;
  private featureRepository: FeatureRepository;
  private taskRepository: TaskRepository;
  private commentRepository: CommentRepository;

  constructor() {
    this.featureRepository = new FeatureRepository();
    this.taskRepository = new TaskRepository();
    this.commentRepository = new CommentRepository();
    this.createFeature = new CreateFeature(this.featureRepository);
    this.voteFeature = new VoteFeature(this.featureRepository);
    this.approveFeature = new ApproveFeature(this.featureRepository);
  }

  /**
   * GET /features
   * List all features with pagination and filters
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

      const {
        page = '1',
        limit = '50',
        status,
        priority,
        productId,
        sprintId,
        assigneeId,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const features = await this.featureRepository.findByWorkspace(workspaceId, {
        status,
        priority,
        productId,
        sprintId,
        assigneeId,
        search,
        limit: limitNum,
        offset,
      });

      // Get total count
      const allFeatures = await this.featureRepository.findByWorkspace(workspaceId, {
        status,
        priority,
        productId,
        sprintId,
        assigneeId,
        search,
      });
      const total = allFeatures.length;

      res.json({
        success: true,
        data: features.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          businessValue: f.businessValue,
          targetUsers: f.targetUsers,
          status: f.status,
          priority: f.priority,
          productId: f.productId,
          requesterId: f.requesterId,
          assigneeId: f.assigneeId,
          sprintId: f.sprintId,
          estimatedHours: f.estimatedHours,
          actualHours: f.actualHours,
          votes: f.votes,
          votedBy: f.votedBy || [],
          approvedBy: f.approvedBy,
          approvedAt: f.approvedAt,
          approvalComment: f.approvalComment,
          rejectedBy: f.rejectedBy,
          rejectedAt: f.rejectedAt,
          rejectionReason: f.rejectionReason,
          attachments: f.attachments || [],
          targetVersion: f.targetVersion,
          tags: f.tags,
          completedAt: f.completedAt,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
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
   * GET /features/:id
   * Get single feature by ID
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const feature: any = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: feature.id,
          workspaceId: feature.workspaceId,
          productId: feature.productId,
          title: feature.title,
          description: feature.description,
          businessValue: feature.businessValue,
          targetUsers: feature.targetUsers,
          status: feature.status,
          priority: feature.priority,
          requesterId: feature.requesterId,
          assigneeId: feature.assigneeId,
          sprintId: feature.sprintId,
          estimatedHours: feature.estimatedHours,
          actualHours: feature.actualHours,
          votes: feature.votes,
          votedBy: feature.votedBy || [],
          approvedBy: feature.approvedBy,
          approvedAt: feature.approvedAt,
          approvalComment: feature.approvalComment,
          rejectedBy: feature.rejectedBy,
          rejectedAt: feature.rejectedAt,
          rejectionReason: feature.rejectionReason,
          attachments: feature.attachments || [],
          targetVersion: feature.targetVersion,
          tags: feature.tags,
          metadata: feature.metadata,
          completedAt: feature.completedAt,
          createdAt: feature.createdAt,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features
   * Create a new feature
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

      const {
        productId,
        title,
        description,
        businessValue,
        targetUsers,
        priority,
        status,
        targetVersion,
      } = req.body;

      const requesterId = req.user!.sub;

      const result = await this.createFeature.execute({
        workspaceId,
        productId,
        title,
        description,
      });

      // Update additional fields if provided
      const feature = await this.featureRepository.findById(result.featureId);
      if (feature) {
        feature.update({
          businessValue,
          targetUsers,
          priority: priority || 'medium',
          targetVersion,
        });

        if (status) {
          feature.changeStatus(status);
        }

        await this.featureRepository.update(feature);
      }

      res.status(201).json({
        success: true,
        data: {
          featureId: result.featureId,
          title: result.title,
          status: result.status,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /features/:id
   * Update feature
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        businessValue,
        targetUsers,
        priority,
        estimatedHours,
        targetVersion,
        tags,
      } = req.body;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.update({
        title,
        description,
        businessValue,
        targetUsers,
        priority,
        estimatedHours,
        targetVersion,
        tags,
      });

      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          title: feature.title,
          status: feature.status,
          priority: feature.priority,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /features/:id
   * Delete feature
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      await this.featureRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /features/:id/status
   * Update feature status
   */
  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.changeStatus(status as FeatureStatus);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          status: feature.status,
          completedAt: feature.completedAt,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features/:id/assign-sprint
   * Assign feature to sprint
   */
  assignSprint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { sprintId } = req.body;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.addToSprint(sprintId);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          sprintId: feature.sprintId,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /features/:id/assign-sprint
   * Unassign feature from sprint
   */
  unassignSprint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.removeFromSprint();
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          sprintId: null,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features/:id/vote
   * Vote for feature
   */
  vote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const feature: any = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      // Check if user already voted
      const votedBy = feature.votedBy || [];
      if (votedBy.includes(userId)) {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_VOTED', message: 'User already voted for this feature' },
        });
        return;
      }

      feature.vote(userId);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          votes: feature.votes,
          votedBy: feature.votedBy,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /features/:id/vote
   * Remove vote from feature
   */
  unvote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const feature: any = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      // Check if user has voted
      const votedBy = feature.votedBy || [];
      if (!votedBy.includes(userId)) {
        res.status(400).json({
          success: false,
          error: { code: 'NOT_VOTED', message: 'User has not voted for this feature' },
        });
        return;
      }

      feature.unvote(userId);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          votes: feature.votes,
          votedBy: feature.votedBy,
          updatedAt: feature.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features/:id/approve
   * Approve feature
   */
  approve = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user!.sub;

      const feature: any = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.approve(userId, comment);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          status: feature.status,
          approvedBy: userId,
          approvedAt: feature.approvedAt,
          approvalComment: comment,
          updatedAt: feature.updatedAt,
        },
        message: 'Feature approved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features/:id/reject
   * Reject feature
   */
  reject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!.sub;

      if (!reason || reason.trim().length < 10) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rejection reason must be at least 10 characters',
          },
        });
        return;
      }

      const feature: any = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      feature.reject(userId, reason);
      await this.featureRepository.update(feature);

      res.json({
        success: true,
        data: {
          id: feature.id,
          status: feature.status,
          rejectedBy: userId,
          rejectedAt: feature.rejectedAt,
          rejectionReason: reason,
          updatedAt: feature.updatedAt,
        },
        message: 'Feature rejected',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /features/:id/tasks
   * Get all tasks linked to feature
   */
  getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      const tasks = await this.taskRepository.findByFeature(id);

      res.json({
        success: true,
        data: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          estimatedHours: t.estimatedHours,
          actualHours: t.actualHours,
          isBlocked: t.isBlocked,
          blockedReason: t.blockedReason,
          completedAt: t.completedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        summary: {
          total: tasks.length,
          completed: tasks.filter((t) => t.isCompleted()).length,
          inProgress: tasks.filter((t) => t.isInProgress()).length,
          blocked: tasks.filter((t) => t.isBlocked).length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /features/:id/comments
   * Get feature comments
   */
  getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      const comments = await this.commentRepository.findByEntity(CommentableType.FEATURE, id);

      res.json({
        success: true,
        data: comments.map((c) => ({
          id: c.id,
          content: c.content,
          authorId: c.authorId,
          parentId: c.parentId,
          isEdited: c.isEdited,
          editedAt: c.editedAt,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /features/:id/comments
   * Add comment to feature
   */
  addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const workspaceId = req.user!.workspaceId!;
      const authorId = req.user!.sub;

      const feature = await this.featureRepository.findById(id);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      const { Comment } = await import('@core/domain/entities/Comment');
      const comment = Comment.create(workspaceId, authorId, CommentableType.FEATURE, id, content);

      await this.commentRepository.save(comment);

      res.status(201).json({
        success: true,
        data: {
          id: comment.id,
          content: comment.content,
          authorId: comment.authorId,
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
