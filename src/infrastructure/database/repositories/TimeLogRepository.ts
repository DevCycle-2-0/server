import { ITimeLogRepository } from '@core/domain/repositories/ITimeLogRepository';
import { TimeLog } from '@core/domain/entities/TimeLog';
import { TimeLogModel } from '../models/TimeLogModel';
import { Op } from 'sequelize';

export class TimeLogRepository implements ITimeLogRepository {
  async findById(id: string): Promise<TimeLog | null> {
    const model: any = await TimeLogModel.findByPk(id);
    if (!model) return null;

    return TimeLog.reconstitute(
      model.id,
      model.task_id,
      model.user_id,
      parseFloat(model.hours.toString()),
      model.date,
      model.description || null,
      model.created_at
    );
  }

  async findByTask(taskId: string): Promise<TimeLog[]> {
    const models: any = await TimeLogModel.findAll({
      where: { task_id: taskId },
      order: [['date', 'DESC']],
    });

    return models.map((model: any) =>
      TimeLog.reconstitute(
        model.id,
        model.task_id,
        model.user_id,
        parseFloat(model.hours.toString()),
        model.date,
        model.description || null,
        model.created_at
      )
    );
  }

  async findByUser(userId: string, startDate?: Date, endDate?: Date): Promise<TimeLog[]> {
    const where: any = { user_id: userId };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: endDate,
      };
    }

    const models = await TimeLogModel.findAll({
      where,
      order: [['date', 'DESC']],
    });

    return models.map((model: any) =>
      TimeLog.reconstitute(
        model.id,
        model.task_id,
        model.user_id,
        parseFloat(model.hours.toString()),
        model.date,
        model.description || null,
        model.created_at
      )
    );
  }

  async save(timeLog: TimeLog): Promise<void> {
    await TimeLogModel.create({
      id: timeLog.id,
      task_id: timeLog.taskId,
      user_id: timeLog.userId,
      hours: timeLog.hours,
      date: timeLog.date,
      description: timeLog.description,
    });
  }

  async delete(id: string): Promise<void> {
    await TimeLogModel.destroy({ where: { id } });
  }
}
