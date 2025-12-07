import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { CreateTaskUseCase } from "@application/use-cases/task/CreateTaskUseCase";
import { GetTasksUseCase } from "@application/use-cases/task/GetTasksUseCase";
import { UpdateTaskStatusUseCase } from "@application/use-cases/task/UpdateTaskStatusUseCase";
import { successResponse } from "@shared/utils/response";
import {
  getPaginationParams,
  getPaginationMeta,
} from "@shared/utils/pagination";
import { TaskRepository } from "@infrastructure/database/repositories/TaskRepository";
import { NotFoundError } from "@shared/errors/AppError";

export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private getTasksUseCase: GetTasksUseCase;
  private updateTaskStatusUseCase: UpdateTaskStatusUseCase;
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    this.getTasksUseCase = new GetTasksUseCase(this.taskRepository);
    this.updateTaskStatusUseCase = new UpdateTaskStatusUseCase(
      this.taskRepository
    );
  }

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, ...filters } = req.query;

      const { tasks, total } = await this.getTasksUseCase.execute(
        workspaceId,
        filters,
        Number(page),
        Number(limit)
      );

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const meta = getPaginationMeta(p, l, total);

      res.json(successResponse(tasks, meta));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const task = await this.createTaskUseCase.execute(
        req.body,
        workspaceId,
        req.user!.userId
      );
      res.status(201).json(successResponse(task));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskRepository.findById(req.params.id);
      if (!task) {
        throw new NotFoundError("Task not found");
      }
      res.json(successResponse(task));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskRepository.update(req.params.id, req.body);
      res.json(successResponse(task));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.taskRepository.delete(req.params.id);
      res.json(successResponse({ message: "Task deleted successfully" }));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status } = req.body;
      const task = await this.updateTaskStatusUseCase.execute(
        req.params.id,
        status
      );
      res.json(successResponse(task));
    } catch (error) {
      next(error);
    }
  };
}
