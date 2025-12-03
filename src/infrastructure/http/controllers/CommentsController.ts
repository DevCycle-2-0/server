import { Response, NextFunction } from 'express';
import { Comment, CommentableType } from '@core/domain/entities/Comment';
import { CommentRepository } from '@infrastructure/database/repositories/CommentRepository';
import { AuthRequest } from '../middleware/auth.middleware';

export class CommentsController {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;

      const comments = await this.commentRepository.findByEntity(
        entityType as CommentableType,
        entityId
      );

      res.json({
        success: true,
        data: comments.map((c) => ({
          id: c.id,
          authorId: c.authorId,
          content: c.content,
          parentId: c.parentId,
          isEdited: c.isEdited,
          editedAt: c.editedAt,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      const { content, parentId } = req.body;
      const workspaceId = req.user!.workspaceId!;
      const authorId = req.user!.sub;

      const comment = Comment.create(
        workspaceId,
        authorId,
        entityType as CommentableType,
        entityId,
        content,
        parentId
      );

      await this.commentRepository.save(comment);

      res.status(201).json({
        success: true,
        data: { commentId: comment.id },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Comment not found' },
        });
        return;
      }

      comment.updateContent(content);
      await this.commentRepository.update(comment);

      res.json({ success: true, message: 'Comment updated' });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      await this.commentRepository.delete(commentId);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  };
}
