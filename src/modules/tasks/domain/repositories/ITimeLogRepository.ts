import { TimeLog } from "../entities/TimeLog";

export interface ITimeLogRepository {
  findById(id: string): Promise<TimeLog | null>;
  findByTaskId(taskId: string): Promise<TimeLog[]>;
  save(timeLog: TimeLog): Promise<TimeLog>;
  delete(id: string): Promise<boolean>;
}
