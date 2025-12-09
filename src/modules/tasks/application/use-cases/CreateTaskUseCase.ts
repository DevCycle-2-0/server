import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { Task } from "@modules/tasks/domain/entities/Task";
import { CreateTaskRequest, TaskDto } from "../dtos/TaskDtos";

interface CreateTaskInput {
  data: CreateTaskRequest;
  workspaceId: string;
}

export class CreateTaskUseCase
  implements UseCase<CreateTaskInput, Result<TaskDto>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Result<TaskDto>> {
    const task = Task.create({
      title: input.data.title,
      description: input.data.description || "",
      type: input.data.type,
      priority: input.data.priority,
      workspaceId: input.workspaceId,
      featureId: input.data.featureId,
      sprintId: input.data.sprintId,
      assigneeId: input.data.assigneeId,
      estimatedHours: input.data.estimatedHours,
      dueDate: input.data.dueDate ? new Date(input.data.dueDate) : undefined,
      labels: input.data.labels || [],
    });

    const savedTask = await this.taskRepository.save(task);

    const response: TaskDto = this.mapToDto(savedTask);
    return Result.ok<TaskDto>(response);
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
