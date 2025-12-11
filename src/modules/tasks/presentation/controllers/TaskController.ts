import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import { CreateTaskUseCase } from "@modules/tasks/application/use-cases/CreateTaskUseCase";
import { GetTasksUseCase } from "@modules/tasks/application/use-cases/GetTasksUseCase";
import { GetTaskByIdUseCase } from "@modules/tasks/application/use-cases/GetTaskByIdUseCase";
import { UpdateTaskUseCase } from "@modules/tasks/application/use-cases/UpdateTaskUseCase";
import { LogTimeUseCase } from "@modules/tasks/application/use-cases/LogTimeUseCase";
import { GetTimeLogsUseCase } from "@modules/tasks/application/use-cases/GetTimeLogsUseCase";
import {
  AddSubtaskUseCase,
  UpdateSubtaskUseCase,
  ToggleSubtaskUseCase,
} from "@modules/tasks/application/use-cases/SubtaskUseCases";
import {
  AddCommentUseCase,
  GetCommentsUseCase,
} from "@modules/tasks/application/use-cases/CommentUseCases";
import { TaskRepository } from "@modules/tasks/infrastructure/persistence/repositories/TaskRepository";
import { TimeLogRepository } from "@modules/tasks/infrastructure/persistence/repositories/TimeLogRepository";
import { CommentRepository } from "@modules/tasks/infrastructure/persistence/repositories/CommentRepository";

export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private getTasksUseCase: GetTasksUseCase;
  private getTaskByIdUseCase: GetTaskByIdUseCase;
  private updateTaskUseCase: UpdateTaskUseCase;
  private logTimeUseCase: LogTimeUseCase;
  private getTimeLogsUseCase: GetTimeLogsUseCase;
  private addSubtaskUseCase: AddSubtaskUseCase;
  private updateSubtaskUseCase: UpdateSubtaskUseCase;
  private toggleSubtaskUseCase: ToggleSubtaskUseCase;
  private addCommentUseCase: AddCommentUseCase;
  private getCommentsUseCase: GetCommentsUseCase;

  constructor() {
    const taskRepository = new TaskRepository();
    const timeLogRepository = new TimeLogRepository();
    const commentRepository = new CommentRepository();

    this.createTaskUseCase = new CreateTaskUseCase(taskRepository);
    this.getTasksUseCase = new GetTasksUseCase(taskRepository);
    this.getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);
    this.updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
    this.logTimeUseCase = new LogTimeUseCase(taskRepository, timeLogRepository);
    this.getTimeLogsUseCase = new GetTimeLogsUseCase(
      taskRepository,
      timeLogRepository
    );
    this.addSubtaskUseCase = new AddSubtaskUseCase(taskRepository);
    this.updateSubtaskUseCase = new UpdateSubtaskUseCase(taskRepository);
    this.toggleSubtaskUseCase = new ToggleSubtaskUseCase(taskRepository);
    this.addCommentUseCase = new AddCommentUseCase(
      taskRepository,
      commentRepository
    );
    this.getCommentsUseCase = new GetCommentsUseCase(
      taskRepository,
      commentRepository
    );
  }

  getTasks = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTasksUseCase.execute({
        query: {
          page: req.query.page ? parseInt(req.query.page as string) : undefined,
          limit: req.query.limit
            ? parseInt(req.query.limit as string)
            : undefined,
          status: req.query.status as string | undefined,
          type: req.query.type as string | undefined,
          priority: req.query.priority as string | undefined,
          featureId: req.query.featureId as string | undefined,
          sprintId: req.query.sprintId as string | undefined,
          assigneeId: req.query.assigneeId as string | undefined,
          search: req.query.search as string | undefined,
        },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      const { tasks, pagination } = result.getValue();

      console.log({ tasks, pagination });

      return ApiResponse.paginated(
        res,
        tasks,
        pagination.page,
        pagination.limit,
        pagination.total
      );
    } catch (error) {
      console.error("Get tasks error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTaskById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTaskByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get task by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  createTask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.createTaskUseCase.execute({
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Create task error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateTask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateTaskUseCase.execute({
        taskId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update task error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteTask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete task use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete task error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateTaskStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement update status use case
      return ApiResponse.success(res, { message: "Status updated" });
    } catch (error) {
      console.error("Update task status error:", error);
      return ApiResponse.internalError(res);
    }
  };

  assignTask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement assign task use case
      return ApiResponse.success(res, { message: "Task assigned" });
    } catch (error) {
      console.error("Assign task error:", error);
      return ApiResponse.internalError(res);
    }
  };

  unassignTask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement unassign task use case
      return ApiResponse.success(res, { message: "Task unassigned" });
    } catch (error) {
      console.error("Unassign task error:", error);
      return ApiResponse.internalError(res);
    }
  };

  logTime = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      const result = await this.logTimeUseCase.execute({
        taskId: req.params.id,
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
      console.error("Log time error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTimeLogs = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTimeLogsUseCase.execute({
        taskId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get time logs error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addSubtask = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.addSubtaskUseCase.execute({
        taskId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Add subtask error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateSubtask = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateSubtaskUseCase.execute({
        taskId: req.params.id,
        subtaskId: req.params.subtaskId,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update subtask error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteSubtask = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete subtask
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete subtask error:", error);
      return ApiResponse.internalError(res);
    }
  };

  toggleSubtask = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.toggleSubtaskUseCase.execute({
        taskId: req.params.id,
        subtaskId: req.params.subtaskId,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Toggle subtask error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getComments = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getCommentsUseCase.execute({
        taskId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get comments error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addComment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const userName = "User"; // Placeholder

      const result = await this.addCommentUseCase.execute({
        taskId: req.params.id,
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
      console.error("Add comment error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateComment = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement update comment use case
      return ApiResponse.success(res, { message: "Comment updated" });
    } catch (error) {
      console.error("Update comment error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteComment = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete comment use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete comment error:", error);
      return ApiResponse.internalError(res);
    }
  };

  addDependency = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement add dependency use case
      return ApiResponse.created(res, { message: "Dependency added" });
    } catch (error) {
      console.error("Add dependency error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeDependency = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement remove dependency use case
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Remove dependency error:", error);
      return ApiResponse.internalError(res);
    }
  };

  uploadAttachment = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement file upload
      return ApiResponse.created(res, { message: "Attachment uploaded" });
    } catch (error) {
      console.error("Upload attachment error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteAttachment = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement delete attachment
      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete attachment error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
