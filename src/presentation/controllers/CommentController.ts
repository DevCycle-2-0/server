import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CreateCommentUseCase } from "@application/use-cases/comment/CreateCommentUseCase";
import { GetCommentsUseCase } from "@application/use-cases/comment/GetCommentsUseCase";
import { successResponse } from "@shared/utils/response";
import {
  getPaginationParams,
  getPaginationMeta,
} from "@shared/utils/pagination";

export class CommentController {
  private createCommentUseCase: CreateCommentUseCase;
  private getCommentsUseCase: GetCommentsUseCase;

  constructor() {
    this.createCommentUseCase = new CreateCommentUseCase();
    this.getCommentsUseCase = new GetCommentsUseCase();
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { entityType, entityId } = req.params;
      const { page, limit } = req.query;

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const { comments, total } = await this.getCommentsUseCase.execute(
        entityType,
        entityId,
        p,
        l
      );

      const meta = getPaginationMeta(p, l, total);
      res.json(successResponse(comments, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId, entityType, entityId } = req.params;
      const { content, parentId, mentions } = req.body;

      const comment = await this.createCommentUseCase.execute(
        workspaceId,
        entityType,
        entityId,
        req.user!.userId,
        content,
        parentId,
        mentions
      );

      res.status(201).json(successResponse(comment));
    } catch (error) {
      next(error);
    }
  };
}
