// src/modules/sprints/presentation/controllers/SprintController.ts
import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  CreateSprintUseCase,
  GetSprintsUseCase,
  GetSprintByIdUseCase,
  UpdateSprintUseCase,
  StartSprintUseCase,
  CompleteSprintUseCase,
  AddTaskToSprintUseCase,
  RemoveTaskFromSprintUseCase,
  SaveRetrospectiveUseCase,
  GetSprintMetricsUseCase,
} from "@modules/sprints/application/use-cases/SprintUseCases";
import { SprintRepository } from "@modules/sprints/infrastructure/persistence/repositories/SprintRepository";
import { ProductRepository } from "@modules/products/infrastructure/persistence/repositories/ProductRepository";
import { TaskRepository } from "@modules/tasks/infrastructure/persistence/repositories/TaskRepository";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";

export class SprintController {
  private createSprintUseCase: CreateSprintUseCase;
  private getSprintsUseCase: GetSprintsUseCase;
  private getSprintByIdUseCase: GetSprintByIdUseCase;
  private updateSprintUseCase: UpdateSprintUseCase;
  private startSprintUseCase: StartSprintUseCase;
  private completeSprintUseCase: CompleteSprintUseCase;
  private addTaskToSprintUseCase: AddTaskToSprintUseCase;
  private removeTaskFromSprintUseCase: RemoveTaskFromSprintUseCase;
  private saveRetrospectiveUseCase: SaveRetrospectiveUseCase;
  private getSprintMetricsUseCase: GetSprintMetricsUseCase;

  constructor() {
    const sprintRepository = new SprintRepository();
    const productRepository = new ProductRepository();
    const taskRepository = new TaskRepository();
    const bugRepository = new BugRepository();

    this.createSprintUseCase = new CreateSprintUseCase(
      sprintRepository,
      productRepository
    );
    this.getSprintsUseCase = new GetSprintsUseCase(sprintRepository);
    this.getSprintByIdUseCase = new GetSprintByIdUseCase(sprintRepository);
    this.updateSprintUseCase = new UpdateSprintUseCase(sprintRepository);
    this.startSprintUseCase = new StartSprintUseCase(sprintRepository);
    this.completeSprintUseCase = new CompleteSprintUseCase(sprintRepository);
    this.addTaskToSprintUseCase = new AddTaskToSprintUseCase(
      sprintRepository,
      taskRepository
    );
    this.removeTaskFromSprintUseCase = new RemoveTaskFromSprintUseCase(
      sprintRepository,
      taskRepository
    );
    this.saveRetrospectiveUseCase = new SaveRetrospectiveUseCase(
      sprintRepository
    );
    this.getSprintMetricsUseCase = new GetSprintMetricsUseCase(
      sprintRepository
    );
  }

  getSprints = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintsUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as string | undefined,
          productId: req.query.productId as string | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { sprints, pagination } = result.getValue();
      return ApiResponse.paginated(
        res,
        sprints,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get sprints error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSprintById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get sprint by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.createSprintUseCase.execute({
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateSprintUseCase.execute({
        sprintId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete sprint use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  startSprint = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.startSprintUseCase.execute({
        sprintId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Start sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  completeSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.completeSprintUseCase.execute({
        sprintId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Complete sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSprintTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      // TODO: Fetch actual task objects
      const sprint = result.getValue();
      return ApiResponse.success(res, sprint.taskIds);
    } catch (error) {
      console.error("Get sprint tasks error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addTaskToSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.addTaskToSprintUseCase.execute({
        sprintId: req.params.id,
        taskId: req.body.taskId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Add task to sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeTaskFromSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.removeTaskFromSprintUseCase.execute({
        sprintId: req.params.id,
        taskId: req.params.taskId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Remove task from sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSprintBugs = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      // TODO: Fetch actual bug objects
      const sprint = result.getValue();
      return ApiResponse.success(res, sprint.bugIds);
    } catch (error) {
      console.error("Get sprint bugs error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addBugToSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement add bug to sprint use case
      return ApiResponse.success(res, { message: "Bug added to sprint" });
    } catch (error) {
      console.error("Add bug to sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeBugFromSprint = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement remove bug from sprint use case
      return ApiResponse.success(res, {
        message: "Bug removed from sprint",
      });
    } catch (error) {
      console.error("Remove bug from sprint error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getSprintMetrics = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintMetricsUseCase.execute({
        sprintId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get sprint metrics error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getRetrospective = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getSprintByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const sprint = result.getValue();
      if (!sprint.retrospective) {
        return ApiResponse.notFound(res, "Retrospective not found");
      }

      return ApiResponse.success(res, sprint.retrospective);
    } catch (error) {
      console.error("Get retrospective error:", error);
      return ApiResponse.internalError(res);
    }
  };

  saveRetrospective = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      const result = await this.saveRetrospectiveUseCase.execute({
        sprintId: req.params.id,
        data: req.body,
        userId: req.user.userId,
        userName: userName,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Save retrospective error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
