import { TimeLog } from '../entities/TimeLog';

export interface ITimeLogRepository {
  findById(id: string): Promise<TimeLog | null>;
  findByTask(taskId: string): Promise<TimeLog[]>;
  findByUser(userId: string, startDate?: Date, endDate?: Date): Promise<TimeLog[]>;
  save(timeLog: TimeLog): Promise<void>;
  delete(id: string): Promise<void>;
}
