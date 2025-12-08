import { ITaskRepository } from '@domain/repositories/ITaskRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateTaskDto } from '@application/dtos/task/UpdateTaskDto';

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    task.update(dto);
    return this.taskRepository.update(taskId, task);
  }
}
