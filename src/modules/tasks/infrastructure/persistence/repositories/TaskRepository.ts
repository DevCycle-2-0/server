import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  ITaskRepository,
  TaskFilters,
  TaskSortOptions,
} from "@modules/tasks/domain/repositories/ITaskRepository";
import {
  Task,
  TaskStatus,
  TaskType,
  Subtask,
  TaskDependency,
} from "@modules/tasks/domain/entities/Task";
import { Priority } from "@modules/features/domain/entities/Feature";
import { TaskModel } from "../models/TaskModel";
import { Op } from "sequelize";

export class TaskRepository
  extends BaseRepository<Task, TaskModel>
  implements ITaskRepository
{
  constructor() {
    super(TaskModel);
  }

  protected toDomain(model: TaskModel): Task {
    const task = Task.create(
      {
        title: model.title,
        description: model.description,
        type: model.type as TaskType,
        priority: model.priority as Priority,
        workspaceId: model.workspaceId,
        status: model.status as TaskStatus,
        featureId: model.featureId,
        featureTitle: model.featureTitle,
        sprintId: model.sprintId,
        sprintName: model.sprintName,
        assigneeId: model.assigneeId,
        assigneeName: model.assigneeName,
        assigneeAvatar: model.assigneeAvatar,
        estimatedHours: model.estimatedHours
          ? Number(model.estimatedHours)
          : undefined,
        dueDate: model.dueDate,
        labels: model.labels,
      },
      model.id
    );

    // Restore subtasks and dependencies
    (task as any).props.subtasks = model.subtasks as Subtask[];
    (task as any).props.dependencies = model.dependencies as TaskDependency[];
    (task as any).props.loggedHours = Number(model.loggedHours);
    (task as any).props.completedAt = model.completedAt;

    return task;
  }

  protected toModel(domain: Task): Partial<TaskModel> {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      type: domain.type,
      priority: domain.priority,
      featureId: domain.featureId,
      featureTitle: domain.featureTitle,
      sprintId: domain.sprintId,
      sprintName: domain.sprintName,
      assigneeId: domain.assigneeId,
      assigneeName: domain.assigneeName,
      assigneeAvatar: domain.assigneeAvatar,
      estimatedHours: domain.estimatedHours,
      loggedHours: domain.loggedHours,
      dueDate: domain.dueDate,
      completedAt: domain.completedAt,
      subtasks: domain.subtasks as any,
      dependencies: domain.dependencies as any,
      labels: domain.labels,
      workspaceId: domain.workspaceId,
    };
  }

  async findAll(
    filters: TaskFilters,
    sortOptions: TaskSortOptions,
    page: number,
    limit: number
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      const statuses = filters.status.split(",").map((s) => s.trim());
      where.status = { [Op.in]: statuses };
    }

    if (filters.type) {
      const types = filters.type.split(",").map((t) => t.trim());
      where.type = { [Op.in]: types };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.featureId) {
      where.featureId = filters.featureId;
    }

    if (filters.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const order: any[] = [];
    if (sortOptions.sortBy) {
      order.push([sortOptions.sortBy, sortOptions.sortOrder || "asc"]);
    } else {
      order.push(["createdAt", "desc"]);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      tasks: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }
}
