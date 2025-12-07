import { v4 as uuidv4 } from "uuid";
import { TimeLog } from "@domain/entities/TimeLog";
import { TimeLogModel } from "@infrastructure/database/models/TimeLogModel";
import { TaskModel } from "@infrastructure/database/models/TaskModel";
import { ValidationError } from "@shared/errors/AppError";

export class LogTimeUseCase {
  async execute(
    taskId: string,
    userId: string,
    hours: number,
    description?: string,
    loggedDate?: Date
  ) {
    if (hours <= 0 || hours > 24) {
      throw new ValidationError("Hours must be between 0.25 and 24");
    }

    const timeLogId = uuidv4();
    const timeLog = TimeLog.create(taskId, userId, hours, description);

    if (loggedDate) {
      timeLog.loggedDate = loggedDate;
    }

    const created = await TimeLogModel.create({
      id: timeLog.id,
      taskId: timeLog.taskId,
      userId: timeLog.userId,
      hours: timeLog.hours,
      description: timeLog.description,
      loggedDate: timeLog.loggedDate,
    });

    // Update task logged hours
    const task = await TaskModel.findByPk(taskId);
    if (task) {
      task.loggedHours = Number(task.loggedHours) + hours;
      await task.save();
    }

    return created;
  }
}
