import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { ITimeLogRepository } from "@modules/tasks/domain/repositories/ITimeLogRepository";
import { TimeLogDto } from "../dtos/TaskDtos";

// src/modules/tasks/application/use-cases/GetTimeLogsUseCase.ts
interface GetTimeLogsInput {
  taskId: string;
  workspaceId: string;
}

export class GetTimeLogsUseCase
  implements UseCase<GetTimeLogsInput, Result<TimeLogDto[]>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private timeLogRepository: ITimeLogRepository
  ) {}

  async execute(input: GetTimeLogsInput): Promise<Result<TimeLogDto[]>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<TimeLogDto[]>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<TimeLogDto[]>("Task not found");
    }

    const timeLogs = await this.timeLogRepository.findByTaskId(input.taskId);

    const response: TimeLogDto[] = timeLogs.map((log) => ({
      id: log.id,
      taskId: log.taskId,
      userId: log.userId,
      userName: log.userName,
      hours: log.hours,
      date: log.date.toISOString().split("T")[0],
      description: log.description,
      createdAt: log.createdAt.toISOString(),
    }));

    return Result.ok<TimeLogDto[]>(response);
  }
}
