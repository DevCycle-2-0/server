import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CreateBugUseCase } from "@application/use-cases/bug/CreateBugUseCase";
import { GetBugsUseCase } from "@application/use-cases/bug/GetBugsUseCase";
import { ResolveBugUseCase } from "@application/use-cases/bug/ResolveBugUseCase";
import { successResponse } from "@shared/utils/response";
import {
  getPaginationParams,
  getPaginationMeta,
} from "@shared/utils/pagination";
import { BugRepository } from "@infrastructure/database/repositories/BugRepository";
import { NotFoundError } from "@shared/errors/AppError";

export class BugController {
  private createBugUseCase: CreateBugUseCase;
  private getBugsUseCase: GetBugsUseCase;
  private resolveBugUseCase: ResolveBugUseCase;
  private bugRepository: BugRepository;

  constructor() {
    this.bugRepository = new BugRepository();
    this.createBugUseCase = new CreateBugUseCase(this.bugRepository);
    this.getBugsUseCase = new GetBugsUseCase(this.bugRepository);
    this.resolveBugUseCase = new ResolveBugUseCase(this.bugRepository);
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { bugs, total } = await this.getBugsUseCase.execute(
        workspaceId,
        filters,
        Number(page),
        Number(limit)
      );

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const meta = getPaginationMeta(p, l, total);

      res.json(successResponse(bugs, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const bug = await this.createBugUseCase.execute(
        req.body,
        workspaceId,
        req.user!.userId
      );
      res.status(201).json(successResponse(bug));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const bug = await this.bugRepository.findById(req.params.id);
      if (!bug) {
        throw new NotFoundError("Bug not found");
      }
      res.json(successResponse(bug));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const bug = await this.bugRepository.update(req.params.id, req.body);
      res.json(successResponse(bug));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.bugRepository.delete(req.params.id);
      res.json(successResponse({ message: "Bug deleted successfully" }));
    } catch (error) {
      next(error);
    }
  };

  resolve = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { resolution } = req.body;
      const bug = await this.resolveBugUseCase.execute(
        req.params.id,
        resolution
      );
      res.json(successResponse(bug));
    } catch (error) {
      next(error);
    }
  };
}
