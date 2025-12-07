import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { NotFoundError } from "@shared/errors/AppError";
import { ItemStatus } from "@shared/types";

export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, newStatus: ItemStatus) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    task.changeStatus(newStatus);
    return this.taskRepository.update(taskId, task);
  }
}
