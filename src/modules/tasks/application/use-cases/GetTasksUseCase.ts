import { GetTasksQuery } from "../dtos/TaskDtos";
import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { Task } from "@modules/tasks/domain/entities/Task";
import { TaskDto } from "../dtos/TaskDtos";

interface GetTasksInput {
  query: GetTasksQuery;
  workspaceId: string;
}

interface GetTasksResult {
  tasks: TaskDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetTasksUseCase
  implements UseCase<GetTasksInput, Result<GetTasksResult>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: GetTasksInput): Promise<Result<GetTasksResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { tasks, total } = await this.taskRepository.findAll(
      {
        status: input.query.status,
        type: input.query.type,
        priority: input.query.priority,
        featureId: input.query.featureId,
        sprintId: input.query.sprintId,
        assigneeId: input.query.assigneeId,
        search: input.query.search,
        workspaceId: input.workspaceId,
      },
      {
        sortBy: undefined,
        sortOrder: undefined,
      },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    const response: GetTasksResult = {
      tasks: tasks.map((task) => this.mapToDto(task)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return Result.ok<GetTasksResult>(response);
  }

  private mapToDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type,
      priority: task.priority,
      featureId: task.featureId,
      featureTitle: task.featureTitle,
      sprintId: task.sprintId,
      sprintName: task.sprintName,
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName,
      assigneeAvatar: task.assigneeAvatar,
      estimatedHours: task.estimatedHours,
      loggedHours: task.loggedHours,
      dueDate: task.dueDate?.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      subtasks: task.subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        completedAt: st.completedAt?.toISOString(),
      })),
      dependencies: task.dependencies,
      labels: task.labels,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
