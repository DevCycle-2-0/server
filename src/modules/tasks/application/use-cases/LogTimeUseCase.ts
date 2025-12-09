import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { ITimeLogRepository } from "@modules/tasks/domain/repositories/ITimeLogRepository";
import { TimeLog } from "@modules/tasks/domain/entities/TimeLog";
import { CreateTimeLogRequest, TimeLogDto } from "../dtos/TaskDtos";

interface LogTimeInput {
  taskId: string;
  data: CreateTimeLogRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class LogTimeUseCase
  implements UseCase<LogTimeInput, Result<TimeLogDto>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private timeLogRepository: ITimeLogRepository
  ) {}

  async execute(input: LogTimeInput): Promise<Result<TimeLogDto>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<TimeLogDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<TimeLogDto>("Task not found");
    }

    const timeLog = TimeLog.create({
      taskId: input.taskId,
      userId: input.userId,
      userName: input.userName,
      hours: input.data.hours,
      date: new Date(input.data.date),
      description: input.data.description,
    });

    const savedTimeLog = await this.timeLogRepository.save(timeLog);

    // Update task's logged hours
    task.addTimeLog(input.data.hours);
    await this.taskRepository.save(task);

    const response: TimeLogDto = {
      id: savedTimeLog.id,
      taskId: savedTimeLog.taskId,
      userId: savedTimeLog.userId,
      userName: savedTimeLog.userName,
      hours: savedTimeLog.hours,
      date: savedTimeLog.date.toISOString().split("T")[0],
      description: savedTimeLog.description,
      createdAt: savedTimeLog.createdAt.toISOString(),
    };

    return Result.ok<TimeLogDto>(response);
  }
}
