import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CreateSprintUseCase } from "@application/use-cases/sprint/CreateSprintUseCase";
import { GetSprintsUseCase } from "@application/use-cases/sprint/GetSprintsUseCase";
import { StartSprintUseCase } from "@application/use-cases/sprint/StartSprintUseCase";
import { CompleteSprintUseCase } from "@application/use-cases/sprint/CompleteSprintUseCase";
import { successResponse } from "@shared/utils/response";
import {
  getPaginationParams,
  getPaginationMeta,
} from "@shared/utils/pagination";
import { SprintRepository } from "@infrastructure/database/repositories/SprintRepository";
import { NotFoundError } from "@shared/errors/AppError";

export class SprintController {
  private createSprintUseCase: CreateSprintUseCase;
  private getSprintsUseCase: GetSprintsUseCase;
  private startSprintUseCase: StartSprintUseCase;
  private completeSprintUseCase: CompleteSprintUseCase;
  private sprintRepository: SprintRepository;

  constructor() {
    this.sprintRepository = new SprintRepository();
    this.createSprintUseCase = new CreateSprintUseCase(this.sprintRepository);
    this.getSprintsUseCase = new GetSprintsUseCase(this.sprintRepository);
    this.startSprintUseCase = new StartSprintUseCase(this.sprintRepository);
    this.completeSprintUseCase = new CompleteSprintUseCase(
      this.sprintRepository
    );
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { sprints, total } = await this.getSprintsUseCase.execute(
        workspaceId,
        filters,
        Number(page),
        Number(limit)
      );

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const meta = getPaginationMeta(p, l, total);

      res.json(successResponse(sprints, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const sprint = await this.createSprintUseCase.execute(
        req.body,
        workspaceId,
        req.user!.userId
      );
      res.status(201).json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.sprintRepository.findById(req.params.id);
      if (!sprint) {
        throw new NotFoundError("Sprint not found");
      }
      res.json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.sprintRepository.update(
        req.params.id,
        req.body
      );
      res.json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.sprintRepository.delete(req.params.id);
      res.json(successResponse({ message: "Sprint deleted successfully" }));
    } catch (error) {
      next(error);
    }
  };

  start = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sprint = await this.startSprintUseCase.execute(req.params.id);
      res.json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { velocity } = req.body;
      const sprint = await this.completeSprintUseCase.execute(
        req.params.id,
        velocity || 0
      );
      res.json(successResponse(sprint));
    } catch (error) {
      next(error);
    }
  };
}
