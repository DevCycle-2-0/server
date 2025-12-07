import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CreateReleaseUseCase } from "@application/use-cases/release/CreateReleaseUseCase";
import { GetReleasesUseCase } from "@application/use-cases/release/GetReleasesUseCase";
import { PublishReleaseUseCase } from "@application/use-cases/release/PublishReleaseUseCase";
import { successResponse } from "@shared/utils/response";
import {
  getPaginationParams,
  getPaginationMeta,
} from "@shared/utils/pagination";
import { ReleaseRepository } from "@infrastructure/database/repositories/ReleaseRepository";
import { NotFoundError } from "@shared/errors/AppError";

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
      const release = await this.releaseRepository.findById(req.params.id);
      if (!release) {
        throw new NotFoundError("Release not found");
      }
      res.json(successResponse(release));
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
      res.json(successResponse({ message: "Release deleted successfully" }));
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
      res.json(successResponse(release));
    } catch (error) {
      next(error);
    }
  };

  rollback = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { reason } = req.body;
      const release = await this.releaseRepository.findById(req.params.id);

      if (!release) {
        throw new NotFoundError("Release not found");
      }

      release.rollback(reason);
      const updated = await this.releaseRepository.update(
        req.params.id,
        release
      );

      res.json(successResponse(updated));
    } catch (error) {
      next(error);
    }
  };
}
