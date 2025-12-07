import { BugSeverity, PriorityLevel, ItemStatus } from "@shared/types";

export class Bug {
  constructor(
    public id: string,
    public workspaceId: string,
    public title: string,
    public description?: string,
    public stepsToReproduce?: string,
    public expectedBehavior?: string,
    public actualBehavior?: string,
    public environment?: Record<string, any>,
    public severity: BugSeverity = BugSeverity.MINOR,
    public priority: PriorityLevel = PriorityLevel.MEDIUM,
    public status: ItemStatus = ItemStatus.TODO,
    public productId?: string,
    public featureId?: string,
    public sprintId?: string,
    public assigneeId?: string,
    public reporterId?: string,
    public tags: string[] = [],
    public attachments: any[] = [],
    public resolution?: string,
    public resolvedAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    title: string,
    reporterId: string,
    severity: BugSeverity,
    description?: string
  ): Bug {
    return new Bug(
      id,
      workspaceId,
      title,
      description,
      undefined,
      undefined,
      undefined,
      undefined,
      severity,
      PriorityLevel.MEDIUM,
      ItemStatus.TODO,
      undefined,
      undefined,
      undefined,
      undefined,
      reporterId
    );
  }

  update(data: Partial<Omit<Bug, "id" | "workspaceId">>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  resolve(resolution: string): void {
    this.status = ItemStatus.DONE;
    this.resolution = resolution;
    this.resolvedAt = new Date();
    this.updatedAt = new Date();
  }
}
