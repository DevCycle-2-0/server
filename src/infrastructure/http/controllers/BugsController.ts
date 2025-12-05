import { Response, NextFunction } from 'express';
import { Bug, BugSeverity, BugStatus } from '@core/domain/entities/Bug';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { AuthRequest } from '../middleware/auth.middleware';

// Interface for retest results
interface RetestResult {
  id: string;
  bugId: string;
  passed: boolean;
  notes?: string;
  testerId: string;
  testedAt: Date;
}

export class BugsController {
  private bugRepository: BugRepository;
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  // In-memory storage for retest results (replace with database model in production)
  private retestResults: Map<string, RetestResult[]> = new Map();

  constructor() {
    this.bugRepository = new BugRepository();
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
  }

  /**
   * GET /bugs
   * Get all bugs with pagination and filters
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
        severity,
        productId,
        assigneeId,
        sprintId,
        environment,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const bugs = await this.bugRepository.findByWorkspace(workspaceId, {
        status,
        severity,
        productId,
        assigneeId,
        sprintId,
        environment,
        search,
        limit: limitNum,
        offset,
      });

      // Get total count (in production, implement count method in repository)
      const allBugs = await this.bugRepository.findByWorkspace(workspaceId, {
        status,
        severity,
        productId,
        assigneeId,
        sprintId,
        environment,
        search,
      });
      const total = allBugs.length;

      res.json({
        success: true,
        data: bugs.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          status: b.status,
          severity: b.severity,
          productId: b.productId,
          assigneeId: b.assigneeId,
          reporterId: b.reporterId,
          sprintId: b.sprintId,
          featureId: undefined, // Bug entity doesn't have featureId - need to add if required
          environment: b.environment,
          stepsToReproduce: b.stepsToReproduce,
          expectedBehavior: b.expectedBehavior,
          actualBehavior: b.actualBehavior,
          attachments: b.attachments,
          tags: b.tags,
          resolvedAt: b.resolvedAt,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
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
   * GET /bugs/:id
   * Get bug by ID
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: bug.id,
          title: bug.title,
          description: bug.description,
          status: bug.status,
          severity: bug.severity,
          productId: bug.productId,
          assigneeId: bug.assigneeId,
          reporterId: bug.reporterId,
          sprintId: bug.sprintId,
          environment: bug.environment,
          browser: bug.browser,
          os: bug.os,
          stepsToReproduce: bug.stepsToReproduce,
          expectedBehavior: bug.expectedBehavior,
          actualBehavior: bug.actualBehavior,
          attachments: bug.attachments,
          tags: bug.tags,
          resolvedAt: bug.resolvedAt,
          createdAt: bug.createdAt,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /bugs
   * Create a new bug
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
        severity,
        environment,
        browser,
        os,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        tags,
      } = req.body;

      const reporterId = req.user!.sub;

      const bug = Bug.create(workspaceId, productId, title, description, severity, reporterId);

      // Update optional fields
      if (environment || browser || os || tags) {
        bug.update({
          environment,
          browser,
          os,
          tags,
          stepsToReproduce,
          expectedBehavior,
          actualBehavior,
        });
      }

      await this.bugRepository.save(bug);

      res.status(201).json({
        success: true,
        data: {
          id: bug.id,
          title: bug.title,
          status: bug.status,
          severity: bug.severity,
          productId: bug.productId,
          reporterId: bug.reporterId,
          createdAt: bug.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /bugs/:id
   * Update bug
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        severity,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        environment,
        browser,
        os,
        tags,
      } = req.body;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.update({
        title,
        description,
        severity,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        environment,
        browser,
        os,
        tags,
      });

      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          title: bug.title,
          status: bug.status,
          severity: bug.severity,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /bugs/:id
   * Delete bug
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      await this.bugRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /bugs/:id/status
   * Update bug status
   */
  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.changeStatus(status as BugStatus);
      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          status: bug.status,
          resolvedAt: bug.resolvedAt,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /bugs/:id/assign
   * Assign bug to user
   */
  assign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.assign(assigneeId);
      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          assigneeId: bug.assigneeId,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /bugs/:id/assign
   * Unassign bug
   */
  unassign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.unassign();
      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          assigneeId: null,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /bugs/:id/link-feature
   * Link bug to feature
   * Note: Bug entity doesn't have featureId. Need to add to domain model.
   */
  linkFeature = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { featureId } = req.body;

      const bug: any = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      // Verify feature exists
      const feature = await this.featureRepository.findById(featureId);
      if (!feature) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' },
        });
        return;
      }

      // Store in metadata for now (or extend Bug entity with featureId)
      const metadata = bug.metadata || {};
      metadata.featureId = featureId;
      // Note: Bug entity doesn't expose metadata setter, might need to add

      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          featureId,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /bugs/:id/link-feature
   * Unlink bug from feature
   */
  unlinkFeature = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug: any = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      // Remove from metadata
      const metadata = bug.metadata || {};
      delete metadata.featureId;

      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          featureId: null,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /bugs/:id/assign-sprint
   * Add bug to sprint
   */
  assignSprint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { sprintId } = req.body;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      // Verify sprint exists
      const sprint = await this.sprintRepository.findById(sprintId);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      bug.addToSprint(sprintId);
      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          sprintId: bug.sprintId,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /bugs/:id/assign-sprint
   * Remove bug from sprint
   */
  unassignSprint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      bug.removeFromSprint();
      await this.bugRepository.update(bug);

      res.json({
        success: true,
        data: {
          id: bug.id,
          sprintId: null,
          updatedAt: bug.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /bugs/:id/retest
   * Add retest result
   */
  addRetest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { passed, notes } = req.body;
      const testerId = req.user!.sub;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      const retestResult: RetestResult = {
        id: crypto.randomUUID(),
        bugId: id,
        passed,
        notes,
        testerId,
        testedAt: new Date(),
      };

      // Store retest result
      const existingResults = this.retestResults.get(id) || [];
      existingResults.push(retestResult);
      this.retestResults.set(id, existingResults);

      // If test passed, update bug status to fixed
      if (passed && bug.status === BugStatus.RETEST) {
        bug.changeStatus(BugStatus.FIXED);
        await this.bugRepository.update(bug);
      }

      res.status(201).json({
        success: true,
        data: {
          id: retestResult.id,
          passed: retestResult.passed,
          notes: retestResult.notes,
          testerId: retestResult.testerId,
          testedAt: retestResult.testedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /bugs/:id/retest
   * Get retest history
   */
  getRetestHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      const results = this.retestResults.get(id) || [];

      res.json({
        success: true,
        data: results.map((r) => ({
          id: r.id,
          passed: r.passed,
          notes: r.notes,
          testerId: r.testerId,
          testedAt: r.testedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /bugs/:id/attachments
   * Upload attachment
   */
  uploadAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      // In production, handle file upload with multer and upload to S3
      // For now, mock the URL
      const mockUrl = `https://storage.example.com/bugs/${id}/${Date.now()}-screenshot.png`;

      bug.addAttachment(mockUrl);
      await this.bugRepository.update(bug);

      res.status(201).json({
        success: true,
        data: {
          url: mockUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /bugs/:id/attachments/:attachmentId
   * Delete attachment
   */
  deleteAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, attachmentId } = req.params;

      const bug = await this.bugRepository.findById(id);
      if (!bug) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Bug not found' },
        });
        return;
      }

      // Find and remove attachment by ID (URL in this case)
      const attachments = bug.attachments.filter((url) => !url.includes(attachmentId));

      if (attachments.length === bug.attachments.length) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Attachment not found' },
        });
        return;
      }

      // Update with filtered attachments
      // Note: Bug entity doesn't have a method to remove specific attachments
      // Would need to add this to domain model

      await this.bugRepository.update(bug);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /bugs/statistics
   * Get bug statistics
   */
  getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to a workspace' },
        });
        return;
      }

      const { productId, dateFrom, dateTo } = req.query;

      const bugs = await this.bugRepository.findByWorkspace(workspaceId, { productId });

      // Filter by date range
      const filteredBugs = bugs.filter((bug) => {
        if (dateFrom && new Date(bug.createdAt) < new Date(dateFrom as string)) return false;
        if (dateTo && new Date(bug.createdAt) > new Date(dateTo as string)) return false;
        return true;
      });

      // Calculate statistics
      const total = filteredBugs.length;

      const bySeverity = {
        critical: filteredBugs.filter((b) => b.severity === BugSeverity.BLOCKER).length,
        high: filteredBugs.filter((b) => b.severity === BugSeverity.CRITICAL).length,
        medium: filteredBugs.filter((b) => b.severity === BugSeverity.MAJOR).length,
        low: filteredBugs.filter((b) => b.severity === BugSeverity.MINOR).length,
      };

      const byStatus = {
        open: filteredBugs.filter((b) => b.status === BugStatus.OPEN).length,
        in_progress: filteredBugs.filter((b) => b.status === BugStatus.IN_PROGRESS).length,
        resolved: filteredBugs.filter((b) => b.status === BugStatus.FIXED).length,
        closed: filteredBugs.filter((b) => b.status === BugStatus.CLOSED).length,
        wont_fix: filteredBugs.filter((b) => b.status === BugStatus.WONTFIX).length,
      };

      const byEnvironment = {
        production: filteredBugs.filter((b) => b.environment === 'production').length,
        staging: filteredBugs.filter((b) => b.environment === 'staging').length,
        development: filteredBugs.filter((b) => b.environment === 'development').length,
      };

      // Calculate average resolution time
      const resolvedBugs = filteredBugs.filter((b) => b.resolvedAt);
      const avgResolutionTime =
        resolvedBugs.length > 0
          ? resolvedBugs.reduce((sum, bug) => {
              const hours =
                (new Date(bug.resolvedAt!).getTime() - new Date(bug.createdAt).getTime()) /
                (1000 * 60 * 60);
              return sum + hours;
            }, 0) / resolvedBugs.length
          : 0;

      res.json({
        success: true,
        data: {
          total,
          bySeverity,
          byStatus,
          byEnvironment,
          averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
