import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { Task } from "@modules/tasks/domain/entities/Task";
import { TaskDto } from "../dtos/TaskDtos";

export class GetTaskByIdUseCase implements UseCase<string, Result<TaskDto>> {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<Result<TaskDto>> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      return Result.fail<TaskDto>("Task not found");
    }

    const response: TaskDto = this.mapToDto(task);
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
