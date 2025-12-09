import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { UpdateTaskRequest } from "../dtos/TaskDtos";
import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { Task } from "@modules/tasks/domain/entities/Task";
import { TaskDto } from "../dtos/TaskDtos";

interface UpdateTaskInput {
  taskId: string;
  data: UpdateTaskRequest;
  workspaceId: string;
}

export class UpdateTaskUseCase
  implements UseCase<UpdateTaskInput, Result<TaskDto>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<Result<TaskDto>> {
    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      return Result.fail<TaskDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<TaskDto>("Task not found");
    }

    task.update(
      input.data.title,
      input.data.description,
      input.data.type,
      input.data.priority,
      input.data.estimatedHours,
      input.data.labels
    );

    const updatedTask = await this.taskRepository.save(task);

    const response: TaskDto = this.mapToDto(updatedTask);
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
