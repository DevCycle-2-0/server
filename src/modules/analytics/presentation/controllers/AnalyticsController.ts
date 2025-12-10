// src/modules/analytics/presentation/controllers/AnalyticsController.ts

import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  GetAnalyticsOverviewUseCase,
  GetVelocityDataUseCase,
  GetBurndownDataUseCase,
  GetBugResolutionTrendsUseCase,
  GetFeatureCompletionDataUseCase,
  GetReleaseFrequencyUseCase,
  GetTeamWorkloadUseCase,
  GetTimeTrackingDataUseCase,
  GetProductHealthUseCase,
  GetTeamPerformanceUseCase,
  ExportAnalyticsUseCase,
} from "@modules/analytics/application/use-cases/AnalyticsUseCases";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";
import { TaskRepository } from "@modules/tasks/infrastructure/persistence/repositories/TaskRepository";
import { SprintRepository } from "@modules/sprints/infrastructure/persistence/repositories/SprintRepository";
import { TeamRepository } from "@modules/team/infrastructure/persistence/repositories/TeamRepository";
import { ReleaseRepository } from "@modules/releases/infrastructure/persistence/repositories/ReleaseRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";

export class AnalyticsController {
  private getAnalyticsOverviewUseCase: GetAnalyticsOverviewUseCase;
  private getVelocityDataUseCase: GetVelocityDataUseCase;
  private getBurndownDataUseCase: GetBurndownDataUseCase;
  private getBugResolutionTrendsUseCase: GetBugResolutionTrendsUseCase;
  private getFeatureCompletionDataUseCase: GetFeatureCompletionDataUseCase;
  private getReleaseFrequencyUseCase: GetReleaseFrequencyUseCase;
  private getTeamWorkloadUseCase: GetTeamWorkloadUseCase;
  private getTimeTrackingDataUseCase: GetTimeTrackingDataUseCase;
  private getProductHealthUseCase: GetProductHealthUseCase;
  private getTeamPerformanceUseCase: GetTeamPerformanceUseCase;
  private exportAnalyticsUseCase: ExportAnalyticsUseCase;

  constructor() {
    const featureRepository = new FeatureRepository();
    const bugRepository = new BugRepository();
    const taskRepository = new TaskRepository();
    const sprintRepository = new SprintRepository();
    const teamRepository = new TeamRepository();
    const releaseRepository = new ReleaseRepository();
    const productRepository = new ProductRepository();

    this.getAnalyticsOverviewUseCase = new GetAnalyticsOverviewUseCase(
      featureRepository,
      bugRepository,
      taskRepository,
      sprintRepository,
      teamRepository
    );

    this.getVelocityDataUseCase = new GetVelocityDataUseCase(sprintRepository);
    this.getBurndownDataUseCase = new GetBurndownDataUseCase(sprintRepository);
    this.getBugResolutionTrendsUseCase = new GetBugResolutionTrendsUseCase(
      bugRepository
    );
    this.getFeatureCompletionDataUseCase = new GetFeatureCompletionDataUseCase(
      featureRepository
    );
    this.getReleaseFrequencyUseCase = new GetReleaseFrequencyUseCase(
      releaseRepository
    );
    this.getTeamWorkloadUseCase = new GetTeamWorkloadUseCase(
      teamRepository,
      taskRepository,
      bugRepository
    );
    this.getTimeTrackingDataUseCase = new GetTimeTrackingDataUseCase(
      taskRepository,
      productRepository
    );
    this.getProductHealthUseCase = new GetProductHealthUseCase(
      productRepository,
      bugRepository,
      featureRepository,
      releaseRepository
    );
    this.getTeamPerformanceUseCase = new GetTeamPerformanceUseCase(
      teamRepository,
      taskRepository,
      bugRepository
    );
    this.exportAnalyticsUseCase = new ExportAnalyticsUseCase();
  }

  getOverview = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getAnalyticsOverviewUseCase.execute({
        workspaceId: req.user.workspaceId,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get analytics overview error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getVelocity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getVelocityDataUseCase.execute({
        workspaceId: req.user.workspaceId,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get velocity error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getBurndown = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBurndownDataUseCase.execute({
        sprintId: req.params.sprintId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get burndown error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getBugResolution = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBugResolutionTrendsUseCase.execute({
        workspaceId: req.user.workspaceId,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        productId: req.query.productId as string | undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get bug resolution error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getFeatureCompletion = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getFeatureCompletionDataUseCase.execute({
        workspaceId: req.user.workspaceId,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get feature completion error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getReleaseFrequency = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getReleaseFrequencyUseCase.execute({
        workspaceId: req.user.workspaceId,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get release frequency error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTeamWorkload = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTeamWorkloadUseCase.execute({
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get team workload error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTimeTracking = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTimeTrackingDataUseCase.execute({
        workspaceId: req.user.workspaceId,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        userId: req.query.userId as string | undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get time tracking error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getProductHealth = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getProductHealthUseCase.execute({
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get product health error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTeamPerformance = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTeamPerformanceUseCase.execute({
        workspaceId: req.user.workspaceId,
        userId: req.query.userId as string | undefined,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get team performance error:", error);
      return ApiResponse.internalError(res);
    }
  };

  exportAnalytics = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.exportAnalyticsUseCase.execute({
        workspaceId: req.user.workspaceId,
        type: req.body.type,
        format: req.body.format,
        startDate: req.body.startDate
          ? new Date(req.body.startDate)
          : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, { data: result.getValue() });
    } catch (error) {
      console.error("Export analytics error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
