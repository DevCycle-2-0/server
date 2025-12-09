// src/modules/features/presentation/controllers/FeatureController.ts
import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import { CreateFeatureUseCase } from "@modules/features/application/use-cases/CreateFeatureUseCase";
import { GetFeaturesUseCase } from "@modules/features/application/use-cases/GetFeaturesUseCase";
import {
  GetFeatureByIdUseCase,
  UpdateFeatureUseCase,
  UpdateFeatureStatusUseCase,
  VoteFeatureUseCase,
  UnvoteFeatureUseCase,
} from "@modules/features/application/use-cases/GetFeatureByIdUseCase";
import { FeatureRepository } from "@modules/features/infrastructure/persistence/repositories/FeatureRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";

export class FeatureController {
  private createFeatureUseCase: CreateFeatureUseCase;
  private getFeaturesUseCase: GetFeaturesUseCase;
  private getFeatureByIdUseCase: GetFeatureByIdUseCase;
  private updateFeatureUseCase: UpdateFeatureUseCase;
  private updateFeatureStatusUseCase: UpdateFeatureStatusUseCase;
  private voteFeatureUseCase: VoteFeatureUseCase;
  private unvoteFeatureUseCase: UnvoteFeatureUseCase;

  constructor() {
    const featureRepository = new FeatureRepository();
    const productRepository = new ProductRepository();

    this.createFeatureUseCase = new CreateFeatureUseCase(
      featureRepository,
      productRepository
    );
    this.getFeaturesUseCase = new GetFeaturesUseCase(featureRepository);
    this.getFeatureByIdUseCase = new GetFeatureByIdUseCase(featureRepository);
    this.updateFeatureUseCase = new UpdateFeatureUseCase(featureRepository);
    this.updateFeatureStatusUseCase = new UpdateFeatureStatusUseCase(
      featureRepository
    );
    this.voteFeatureUseCase = new VoteFeatureUseCase(featureRepository);
    this.unvoteFeatureUseCase = new UnvoteFeatureUseCase(featureRepository);
  }

  getFeatures = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getFeaturesUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as string | undefined,
          priority: req.query.priority as string | undefined,
          productId: req.query.productId as string | undefined,
          platform: req.query.platform as string | undefined,
          assigneeId: req.query.assigneeId as string | undefined,
          sprintId: req.query.sprintId as string | undefined,
          search: req.query.search as string | undefined,
          sortBy: req.query.sortBy as string | undefined,
          sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { features, pagination } = result.getValue();
      return ApiResponse.paginated(
        res,
        features,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get features error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getFeatureById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getFeatureByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get feature by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // Get user name from authenticated user (placeholder)
      const userName = "User";

      const result = await this.createFeatureUseCase.execute({
        data: req.body,
        userId: req.user.userId,
        userName: userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateFeatureUseCase.execute({
        featureId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement soft delete or actual delete
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateFeatureStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateFeatureStatusUseCase.execute({
        featureId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update feature status error:", error);
      return ApiResponse.internalError(res);
    }
  };

  voteFeature = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.voteFeatureUseCase.execute({
        featureId: req.params.id,
        userId: req.user.userId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Vote feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unvoteFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.unvoteFeatureUseCase.execute({
        featureId: req.params.id,
        userId: req.user.userId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Unvote feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  assignSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement assign sprint use case
      return ApiResponse.success(res, {
        message: "Feature assigned to sprint",
      });
    } catch (error) {
      console.error("Assign sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unassignSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement unassign sprint use case
      return ApiResponse.success(res, {
        message: "Feature unassigned from sprint",
      });
    } catch (error) {
      console.error("Unassign sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  approveFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement approve feature use case
      return ApiResponse.success(res, { message: "Feature approved" });
    } catch (error) {
      console.error("Approve feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  rejectFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement reject feature use case
      return ApiResponse.success(res, { message: "Feature rejected" });
    } catch (error) {
      console.error("Reject feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getFeatureTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement get feature tasks
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get feature tasks error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getFeatureComments = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement get feature comments
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get feature comments error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addFeatureComment = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement add feature comment
      return ApiResponse.created(res, { message: "Comment added" });
    } catch (error) {
      console.error("Add feature comment error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
