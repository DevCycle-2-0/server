import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { Task } from "@domain/entities/Task";
import { TaskModel } from "../models/TaskModel";
import { Op } from "sequelize";

export class TaskRepository implements ITaskRepository {
  async create(task: Task): Promise<Task> {
    const created = await TaskModel.create({
      id: task.id,
      workspaceId: task.workspaceId,
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      priority: task.priority,
      storyPoints: task.storyPoints,
      estimatedHours: task.estimatedHours,
      loggedHours: task.loggedHours,
      productId: task.productId,
      featureId: task.featureId,
      sprintId: task.sprintId,
      parentTaskId: task.parentTaskId,
      assigneeId: task.assigneeId,
      reporterId: task.reporterId,
      tags: task.tags,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      position: task.position,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await TaskModel.findByPk(id, {
      include: ["product", "feature", "sprint", "assignee", "reporter"],
    });
    return task ? this.toDomain(task) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ tasks: Task[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = { workspaceId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.featureId) where.featureId = filters.featureId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { rows, count } = await TaskModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["position", "ASC"],
        ["createdAt", "DESC"],
      ],
      include: ["product", "feature", "sprint", "assignee", "reporter"],
    });

    return {
      tasks: rows.map((t) => this.toDomain(t)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    await TaskModel.update(data, { where: { id } });
    const updated = await TaskModel.findByPk(id);
    if (!updated) throw new Error("Task not found");
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await TaskModel.destroy({ where: { id } });
  }

  private toDomain(model: TaskModel): Task {
    return new Task(
      model.id,
      model.workspaceId,
      model.title,
      model.description,
      model.type,
      model.status,
      model.priority,
      model.storyPoints,
      model.estimatedHours,
      model.loggedHours,
      model.productId,
      model.featureId,
      model.sprintId,
      model.parentTaskId,
      model.assigneeId,
      model.reporterId,
      model.tags,
      model.dueDate,
      model.completedAt,
      model.position,
      model.createdAt,
      model.updatedAt
    );
  }
}
