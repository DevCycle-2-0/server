import { Response, NextFunction } from 'express';
import { Bug } from '@core/domain/entities/Bug';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class BugsController {
  private bugRepository: BugRepository;

  constructor() {
    this.bugRepository = new BugRepository();
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

      const { status, severity, productId, assigneeId, limit, offset } = req.query;

      const bugs = await this.bugRepository.findByWorkspace(workspaceId, {
        status,
        severity,
        productId,
        assigneeId,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        data: bugs.map((b) => ({
          id: b.id,
          workspaceId: b.workspaceId,
          productId: b.productId,
          sprintId: b.sprintId,
          title: b.title,
          description: b.description,
          status: b.status,
          severity: b.severity,
          reporterId: b.reporterId,
          assigneeId: b.assigneeId,
          environment: b.environment,
          browser: b.browser,
          os: b.os,
          attachments: b.attachments,
          tags: b.tags,
          resolvedAt: b.resolvedAt,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        })),
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

      const { productId, title, description, severity, environment, browser, os } = req.body;
      const reporterId = req.user!.sub;

      const bug = Bug.create(workspaceId, productId, title, description, severity, reporterId);

      if (environment) bug.update({ environment });
      if (browser) bug.update({ browser });
      if (os) bug.update({ os });

      await this.bugRepository.save(bug);

      res.status(201).json({
        success: true,
        data: { bugId: bug.id, title: bug.title, severity: bug.severity, status: bug.status },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

      if (status) {
        bug.changeStatus(status);
      }

      await this.bugRepository.update(bug);

      res.json({ success: true, message: 'Bug updated successfully' });
    } catch (error) {
      next(error);
    }
  };
}
