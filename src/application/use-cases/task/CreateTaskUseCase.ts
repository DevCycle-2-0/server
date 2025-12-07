import { v4 as uuidv4 } from "uuid";
import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { Task } from "@domain/entities/Task";
import { CreateTaskDto } from "@application/dtos/task/CreateTaskDto";

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(dto: CreateTaskDto, workspaceId: string, userId: string) {
    const taskId = uuidv4();
    const task = Task.create(
      taskId,
      workspaceId,
      dto.title,
      userId,
      dto.description
    );

    if (dto.type) task.type = dto.type;
    if (dto.priority) task.priority = dto.priority;
    if (dto.storyPoints) task.storyPoints = dto.storyPoints;
    if (dto.estimatedHours) task.estimatedHours = dto.estimatedHours;
    if (dto.productId) task.productId = dto.productId;
    if (dto.featureId) task.featureId = dto.featureId;
    if (dto.sprintId) task.sprintId = dto.sprintId;
    if (dto.parentTaskId) task.parentTaskId = dto.parentTaskId;
    if (dto.assigneeId) task.assigneeId = dto.assigneeId;
    if (dto.tags) task.tags = dto.tags;
    if (dto.dueDate) task.dueDate = dto.dueDate;

    return this.taskRepository.create(task);
  }
}
