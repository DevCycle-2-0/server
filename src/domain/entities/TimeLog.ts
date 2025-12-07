export class TimeLog {
  constructor(
    public id: string,
    public taskId: string,
    public userId: string,
    public hours: number,
    public description?: string,
    public loggedDate: Date = new Date(),
    public createdAt: Date = new Date()
  ) {}

  static create(
    id: string,
    taskId: string,
    userId: string,
    hours: number,
    description?: string
  ): TimeLog {
    return new TimeLog(id, taskId, userId, hours, description);
  }
}
