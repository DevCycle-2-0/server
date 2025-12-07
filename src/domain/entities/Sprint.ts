import { SprintStatus } from "@shared/types";

export class Sprint {
  constructor(
    public id: string,
    public workspaceId: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public status: SprintStatus = SprintStatus.PLANNING,
    public goal?: string,
    public capacityPoints?: number,
    public completedPoints: number = 0,
    public velocity?: number,
    public productId?: string,
    public retrospective?: Record<string, any>,
    public createdBy?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    createdBy: string
  ): Sprint {
    return new Sprint(
      id,
      workspaceId,
      name,
      startDate,
      endDate,
      SprintStatus.PLANNING,
      undefined,
      undefined,
      0,
      undefined,
      undefined,
      undefined,
      createdBy
    );
  }

  update(data: {
    name?: string;
    goal?: string;
    endDate?: Date;
    capacityPoints?: number;
  }): void {
    if (data.name) this.name = data.name;
    if (data.goal !== undefined) this.goal = data.goal;
    if (data.endDate) this.endDate = data.endDate;
    if (data.capacityPoints) this.capacityPoints = data.capacityPoints;
    this.updatedAt = new Date();
  }

  start(): void {
    this.status = SprintStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  complete(velocity: number): void {
    this.status = SprintStatus.COMPLETED;
    this.velocity = velocity;
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = SprintStatus.CANCELLED;
    this.updatedAt = new Date();
  }
}
