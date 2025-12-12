// src/modules/bugs/presentation/controllers/BugController.ts
import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  CreateBugUseCase,
  GetBugsUseCase,
  GetBugByIdUseCase,
  UpdateBugUseCase,
  UpdateBugStatusUseCase,
  AddRetestResultUseCase,
  GetBugStatisticsUseCase,
} from "@modules/bugs/application/use-cases/BugUseCases";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";

export class BugController {
  private createBugUseCase: CreateBugUseCase;
  private getBugsUseCase: GetBugsUseCase;
  private getBugByIdUseCase: GetBugByIdUseCase;
  private updateBugUseCase: UpdateBugUseCase;
  private updateBugStatusUseCase: UpdateBugStatusUseCase;
  private addRetestResultUseCase: AddRetestResultUseCase;
  private getBugStatisticsUseCase: GetBugStatisticsUseCase;

  constructor() {
    const bugRepository = new BugRepository();
    const productRepository = new ProductRepository();

    this.createBugUseCase = new CreateBugUseCase(
      bugRepository,
      productRepository
    );
    this.getBugsUseCase = new GetBugsUseCase(bugRepository);
    this.getBugByIdUseCase = new GetBugByIdUseCase(bugRepository);
    this.updateBugUseCase = new UpdateBugUseCase(bugRepository);
    this.updateBugStatusUseCase = new UpdateBugStatusUseCase(bugRepository);
    this.addRetestResultUseCase = new AddRetestResultUseCase(bugRepository);
    this.getBugStatisticsUseCase = new GetBugStatisticsUseCase(bugRepository);
  }

  /**
   * Helper function to convert array to string with numbered format
   */
  private arrayToString(value: string | string[]): string {
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item, index) => `${index + 1}. ${item}`).join("\n");
    }
    return String(value);
  }

  getBugs = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBugsUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as string | undefined,
          severity: req.query.severity as string | undefined,
          priority: req.query.priority as string | undefined,
          productId: req.query.productId as string | undefined,
          platform: req.query.platform as string | undefined,
          assigneeId: req.query.assigneeId as string | undefined,
          reporterId: req.query.reporterId as string | undefined,
          sprintId: req.query.sprintId as string | undefined,
          search: req.query.search as string | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { bugs, pagination } = result.getValue();
      return ApiResponse.paginated(
        res,
        bugs,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get bugs error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getBugById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBugByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get bug by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      // Normalize array fields to strings
      const normalizedData = {
        ...req.body,
        stepsToReproduce: this.arrayToString(req.body.stepsToReproduce),
        expectedBehavior: this.arrayToString(req.body.expectedBehavior),
        actualBehavior: this.arrayToString(req.body.actualBehavior),
      };

      const result = await this.createBugUseCase.execute({
        data: normalizedData,
        userId: req.user.userId,
        userName: userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // Normalize array fields to strings if present
      const normalizedData = { ...req.body };
      if (req.body.stepsToReproduce !== undefined) {
        normalizedData.stepsToReproduce = this.arrayToString(
          req.body.stepsToReproduce
        );
      }
      if (req.body.expectedBehavior !== undefined) {
        normalizedData.expectedBehavior = this.arrayToString(
          req.body.expectedBehavior
        );
      }
      if (req.body.actualBehavior !== undefined) {
        normalizedData.actualBehavior = this.arrayToString(
          req.body.actualBehavior
        );
      }

      const result = await this.updateBugUseCase.execute({
        bugId: req.params.id,
        data: normalizedData,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete bug use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateBugStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateBugStatusUseCase.execute({
        bugId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update bug status error:", error);
      return ApiResponse.internalError(res);
    }
  };

  assignBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement assign use case with user lookup
      return ApiResponse.success(res, { message: "Bug assigned" });
    } catch (error) {
      console.error("Assign bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unassignBug = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement unassign use case
      return ApiResponse.success(res, { message: "Bug unassigned" });
    } catch (error) {
      console.error("Unassign bug error:", error);
      return ApiResponse.internalError(res);
    }
  };

  linkFeature = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement link feature use case
      return ApiResponse.success(res, { message: "Feature linked" });
    } catch (error) {
      console.error("Link feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unlinkFeature = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement unlink feature use case
      return ApiResponse.success(res, { message: "Feature unlinked" });
    } catch (error) {
      console.error("Unlink feature error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addToSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement add to sprint use case
      return ApiResponse.success(res, { message: "Bug added to sprint" });
    } catch (error) {
      console.error("Add to sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeFromSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement remove from sprint use case
      return ApiResponse.success(res, {
        message: "Bug removed from sprint",
      });
    } catch (error) {
      console.error("Remove from sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addRetestResult = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      const result = await this.addRetestResultUseCase.execute({
        bugId: req.params.id,
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
      console.error("Add retest result error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getRetestHistory = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBugByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const bug = result.getValue();
      return ApiResponse.success(res, bug.retestResults);
    } catch (error) {
      console.error("Get retest history error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getBugStatistics = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getBugStatisticsUseCase.execute({
        productId: req.query.productId as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get bug statistics error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
