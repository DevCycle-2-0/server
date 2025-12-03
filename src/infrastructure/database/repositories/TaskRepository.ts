import { Task, TaskStatus } from '@core/domain/entities/Task';
import { Priority } from '@core/domain/entities/Feature';
import { TaskModel } from '../models/TaskModel';

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByWorkspace(workspaceId: string, filters?: any): Promise<Task[]>;
  findBySprint(sprintId: string): Promise<Task[]>;
  findByFeature(featureId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

export class TaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    const model = await TaskModel.findByPk(id);
    if (!model) return null;

    return Task.reconstitute(
      model.id,
      model.workspace_id,
      model.sprint_id || null,
      model.feature_id || null,
      model.title,
      model.description || null,
      model.status as TaskStatus,
      model.priority as Priority,
      model.assignee_id || null,
      model.estimated_hours || null,
      model.actual_hours || null,
      model.is_blocked,
      model.blocked_reason || null,
      model.tags,
      model.metadata,
      model.completed_at || null,
      model.created_at,
      model.updated_at
    );
  }

  async findByWorkspace(workspaceId: string, filters?: any): Promise<Task[]> {
    const where: any = { workspace_id: workspaceId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assigneeId) where.assignee_id = filters.assigneeId;
    if (filters?.isBlocked !== undefined) where.is_blocked = filters.isBlocked;

    const models = await TaskModel.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    });

    return models.map((model) =>
      Task.reconstitute(
        model.id,
        model.workspace_id,
        model.sprint_id || null,
        model.feature_id || null,
        model.title,
        model.description || null,
        model.status as TaskStatus,
        model.priority as Priority,
        model.assignee_id || null,
        model.estimated_hours || null,
        model.actual_hours || null,
        model.is_blocked,
        model.blocked_reason || null,
        model.tags,
        model.metadata,
        model.completed_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findBySprint(sprintId: string): Promise<Task[]> {
    const models = await TaskModel.findAll({
      where: { sprint_id: sprintId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model) =>
      Task.reconstitute(
        model.id,
        model.workspace_id,
        model.sprint_id || null,
        model.feature_id || null,
        model.title,
        model.description || null,
        model.status as TaskStatus,
        model.priority as Priority,
        model.assignee_id || null,
        model.estimated_hours || null,
        model.actual_hours || null,
        model.is_blocked,
        model.blocked_reason || null,
        model.tags,
        model.metadata,
        model.completed_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findByFeature(featureId: string): Promise<Task[]> {
    const models = await TaskModel.findAll({
      where: { feature_id: featureId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model) =>
      Task.reconstitute(
        model.id,
        model.workspace_id,
        model.sprint_id || null,
        model.feature_id || null,
        model.title,
        model.description || null,
        model.status as TaskStatus,
        model.priority as Priority,
        model.assignee_id || null,
        model.estimated_hours || null,
        model.actual_hours || null,
        model.is_blocked,
        model.blocked_reason || null,
        model.tags,
        model.metadata,
        model.completed_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(task: Task): Promise<void> {
    await TaskModel.create({
      id: task.id,
      workspace_id: task.workspaceId,
      sprint_id: task.sprintId,
      feature_id: task.featureId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee_id: task.assigneeId,
      estimated_hours: task.estimatedHours,
      actual_hours: task.actualHours,
      is_blocked: task.isBlocked,
      blocked_reason: task.blockedReason,
      tags: task.tags,
      metadata: task.metadata || {},
      completed_at: task.completedAt,
    });
  }

  async update(task: Task): Promise<void> {
    await TaskModel.update(
      {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId,
        estimated_hours: task.estimatedHours,
        actual_hours: task.actualHours,
        is_blocked: task.isBlocked,
        blocked_reason: task.blockedReason,
        tags: task.tags,
        metadata: task.metadata || {},
        completed_at: task.completedAt,
        updated_at: task.updatedAt,
      },
      {
        where: { id: task.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await TaskModel.destroy({ where: { id } });
  }
}
