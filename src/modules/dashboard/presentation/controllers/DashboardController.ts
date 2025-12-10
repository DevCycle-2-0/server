import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  GetDashboardStatsUseCase,
  GetActivityFeedUseCase,
  GetSprintSummaryUseCase,
} from "@modules/dashboard/application/use-cases/DashboardUseCases";
import { TaskRepository } from "@modules/tasks/infrastructure/persistence/repositories/TaskRepository";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";
import { SprintRepository } from "@modules/sprints/infrastructure/persistence/repositories/SprintRepository";
import { ReleaseRepository } from "@modules/releases/infrastructure/persistence/repositories/ReleaseRepository";
import { TeamRepository } from "@modules/team/infrastructure/persistence/repositories/TeamRepository";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";
import { ActivityRepository } from "@modules/dashboard/infrastructure/persistence/repositories/ActivityRepository";

export class DashboardController {
  private getDashboardStatsUseCase: GetDashboardStatsUseCase;
  private getActivityFeedUseCase: GetActivityFeedUseCase;
  private getSprintSummaryUseCase: GetSprintSummaryUseCase;

  constructor() {
    const taskRepository = new TaskRepository();
    const bugRepository = new BugRepository();
    const sprintRepository = new SprintRepository();
    const releaseRepository = new ReleaseRepository();
    const teamRepository = new TeamRepository();
    const featureRepository = new FeatureRepository();
    const activityRepository = new ActivityRepository();

    this.getDashboardStatsUseCase = new GetDashboardStatsUseCase(
      taskRepository,
      bugRepository,
      sprintRepository,
      releaseRepository,
      teamRepository,
      featureRepository
    );

    this.getActivityFeedUseCase = new GetActivityFeedUseCase(
      activityRepository
    );

    this.getSprintSummaryUseCase = new GetSprintSummaryUseCase(
      sprintRepository,
      taskRepository,
      teamRepository
    );
  }

  getStats = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getDashboardStatsUseCase.execute({
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getActivityFeedUseCase.execute({
        workspaceId: req.user.workspaceId,
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          type: req.query.type as string | undefined,
        },
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get activity feed error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSprintSummary = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintSummaryUseCase.execute({
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, {
        data: {
          activeSprints: result.getValue(),
        },
      });
    } catch (error) {
      console.error("Get sprint summary error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
