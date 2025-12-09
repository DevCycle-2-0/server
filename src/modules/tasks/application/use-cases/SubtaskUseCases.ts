import {
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  SubtaskDto,
} from "../dtos/TaskDtos";
import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";

interface SubtaskInput {
  taskId: string;
  workspaceId: string;
}

interface CreateSubtaskInput extends SubtaskInput {
  data: CreateSubtaskRequest;
}

export class AddSubtaskUseCase
  implements UseCase<CreateSubtaskInput, Result<SubtaskDto>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: CreateSubtaskInput): Promise<Result<SubtaskDto>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    const subtask = task.addSubtask(input.data.title);
    await this.taskRepository.save(task);

    const response: SubtaskDto = {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      completedAt: subtask.completedAt?.toISOString(),
    };

    return Result.ok<SubtaskDto>(response);
  }
}

interface UpdateSubtaskInput extends SubtaskInput {
  subtaskId: string;
  data: UpdateSubtaskRequest;
}

export class UpdateSubtaskUseCase
  implements UseCase<UpdateSubtaskInput, Result<SubtaskDto>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: UpdateSubtaskInput): Promise<Result<SubtaskDto>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    const updated = task.updateSubtask(
      input.subtaskId,
      input.data.title,
      input.data.completed
    );

    if (!updated) {
      return Result.fail<SubtaskDto>("Subtask not found");
    }

    await this.taskRepository.save(task);

    const subtask = task.subtasks.find((st) => st.id === input.subtaskId)!;
    const response: SubtaskDto = {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      completedAt: subtask.completedAt?.toISOString(),
    };

    return Result.ok<SubtaskDto>(response);
  }
}

interface ToggleSubtaskInput extends SubtaskInput {
  subtaskId: string;
}

export class ToggleSubtaskUseCase
  implements UseCase<ToggleSubtaskInput, Result<SubtaskDto>>
{
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: ToggleSubtaskInput): Promise<Result<SubtaskDto>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<SubtaskDto>("Task not found");
    }

    const toggled = task.toggleSubtask(input.subtaskId);
    if (!toggled) {
      return Result.fail<SubtaskDto>("Subtask not found");
    }

    await this.taskRepository.save(task);

    const subtask = task.subtasks.find((st) => st.id === input.subtaskId)!;
    const response: SubtaskDto = {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      completedAt: subtask.completedAt?.toISOString(),
    };

    return Result.ok<SubtaskDto>(response);
  }
}
