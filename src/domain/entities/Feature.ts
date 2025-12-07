import { FeatureStage, PriorityLevel, ItemStatus } from "@shared/types";

export class Feature {
  constructor(
    public id: string,
    public workspaceId: string,
    public title: string,
    public description?: string,
    public stage: FeatureStage = FeatureStage.IDEA,
    public priority: PriorityLevel = PriorityLevel.MEDIUM,
    public status: ItemStatus = ItemStatus.BACKLOG,
    public votes: number = 0,
    public storyPoints?: number,
    public productId?: string,
    public sprintId?: string,
    public targetReleaseId?: string,
    public assigneeId?: string,
    public reporterId?: string,
    public tags: string[] = [],
    public attachments: any[] = [],
    public customFields: Record<string, any> = {},
    public dueDate?: Date,
    public completedAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    title: string,
    reporterId: string,
    description?: string
  ): Feature {
    return new Feature(
      id,
      workspaceId,
      title,
      description,
      FeatureStage.IDEA,
      PriorityLevel.MEDIUM,
      ItemStatus.BACKLOG,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      reporterId
    );
  }

  update(data: Partial<Omit<Feature, "id" | "workspaceId">>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  changeStage(newStage: FeatureStage): void {
    this.stage = newStage;
    this.updatedAt = new Date();
  }

  assignToSprint(sprintId: string): void {
    this.sprintId = sprintId;
    this.updatedAt = new Date();
  }

  addVote(): void {
    this.votes++;
    this.updatedAt = new Date();
  }

  removeVote(): void {
    if (this.votes > 0) {
      this.votes--;
      this.updatedAt = new Date();
    }
  }

  complete(): void {
    this.status = ItemStatus.DONE;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }
}
