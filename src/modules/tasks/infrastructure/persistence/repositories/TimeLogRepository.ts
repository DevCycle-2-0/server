import { TimeLog } from "@modules/tasks/domain/entities/TimeLog";
import { ITimeLogRepository } from "@modules/tasks/domain/repositories/ITimeLogRepository";
import { TimeLogModel } from "../models/TimeLogModel";
import { BaseRepository } from "@shared/infrastructure/BaseRepository";

export class TimeLogRepository
  extends BaseRepository<TimeLog, TimeLogModel>
  implements ITimeLogRepository
{
  constructor() {
    super(TimeLogModel);
  }

  protected toDomain(model: TimeLogModel): TimeLog {
    return TimeLog.create(
      {
        taskId: model.taskId,
        userId: model.userId,
        userName: model.userName,
        hours: Number(model.hours),
        date: model.date,
        description: model.description,
      },
      model.id
    );
  }

  protected toModel(domain: TimeLog): Partial<TimeLogModel> {
    return {
      id: domain.id,
      taskId: domain.taskId,
      userId: domain.userId,
      userName: domain.userName,
      hours: domain.hours,
      date: domain.date,
      description: domain.description,
    };
  }

  async findByTaskId(taskId: string): Promise<TimeLog[]> {
    const models = await this.model.findAll({
      where: { taskId },
      order: [["date", "DESC"]],
    });
    return models.map((model) => this.toDomain(model));
  }
}
