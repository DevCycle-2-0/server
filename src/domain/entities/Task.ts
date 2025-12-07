import { ItemStatus, PriorityLevel } from "@shared/types";

export class Task {
  constructor(
    public id: string,
    public workspaceId: string,
    public title: string,
    public description?: string,
    public type: string = "task",
    public status: ItemStatus = ItemStatus.TODO,
    public priority: PriorityLevel = PriorityLevel.MEDIUM,
    public storyPoints?: number,
    public estimatedHours?: number,
    public loggedHours: number = 0,
    public productId?: string,
    public featureId?: string,
    public sprintId?: string,
    public parentTaskId?: string,
    public assigneeId?: string,
    public reporterId?: string,
    public tags: string[] = [],
    public dueDate?: Date,
    public completedAt?: Date,
    public position: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    title: string,
    reporterId: string,
    description?: string
  ): Task {
    return new Task(
      id,
      workspaceId,
      title,
      description,
      "task",
      ItemStatus.TODO,
      PriorityLevel.MEDIUM,
      undefined,
      undefined,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      reporterId
    );
  }

  update(data: Partial<Omit<Task, "id" | "workspaceId">>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  changeStatus(newStatus: ItemStatus): void {
    this.status = newStatus;
    if (newStatus === ItemStatus.DONE) {
      this.completedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  logTime(hours: number): void {
    this.loggedHours += hours;
    this.updatedAt = new Date();
  }
}
