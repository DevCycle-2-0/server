import { ReleaseStatus } from "@shared/types";

export class Release {
  constructor(
    public id: string,
    public workspaceId: string,
    public version: string,
    public name?: string,
    public description?: string,
    public releaseNotes?: string,
    public status: ReleaseStatus = ReleaseStatus.DRAFT,
    public releaseType: string = "minor",
    public targetDate?: Date,
    public releasedAt?: Date,
    public releasedBy?: string,
    public rollbackReason?: string,
    public rolledBackAt?: Date,
    public productId?: string,
    public pipelineConfig: Record<string, any> = {},
    public createdBy?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    version: string,
    releaseType: string,
    createdBy: string
  ): Release {
    return new Release(
      id,
      workspaceId,
      version,
      undefined,
      undefined,
      undefined,
      ReleaseStatus.DRAFT,
      releaseType,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {},
      createdBy
    );
  }

  update(data: Partial<Omit<Release, "id" | "workspaceId">>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  publish(releasedBy: string): void {
    this.status = ReleaseStatus.RELEASED;
    this.releasedAt = new Date();
    this.releasedBy = releasedBy;
    this.updatedAt = new Date();
  }

  rollback(reason: string): void {
    this.status = ReleaseStatus.ROLLED_BACK;
    this.rollbackReason = reason;
    this.rolledBackAt = new Date();
    this.updatedAt = new Date();
  }
}
