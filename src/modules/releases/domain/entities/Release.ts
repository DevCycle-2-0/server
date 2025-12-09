import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "@modules/products/domain/entities/Product";

export type ReleaseStatus =
  | "planning"
  | "in_development"
  | "testing"
  | "staged"
  | "released"
  | "rolled_back";

export type PipelineStage =
  | "build"
  | "unit_tests"
  | "integration_tests"
  | "security_scan"
  | "staging_deploy"
  | "production_deploy";

export type PipelineStatus =
  | "pending"
  | "running"
  | "passed"
  | "failed"
  | "skipped";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface PipelineStep {
  stage: PipelineStage;
  status: PipelineStatus;
  startedAt?: Date;
  completedAt?: Date;
  logs?: string;
}

export interface RollbackLog {
  id: string;
  version: string;
  reason: string;
  rolledBackAt: Date;
  rolledBackBy: string;
  notes?: string;
}

export interface LinkedFeature {
  featureId: string;
  featureTitle: string;
}

export interface LinkedBugFix {
  bugId: string;
  bugTitle: string;
}

export interface Approver {
  userId: string;
  userName: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  approvedAt?: Date;
}

interface ReleaseProps {
  version: string;
  buildId: string;
  productId: string;
  productName: string;
  platform: Platform;
  status: ReleaseStatus;
  releaseDate?: Date;
  plannedDate?: Date;
  features: LinkedFeature[];
  bugFixes: LinkedBugFix[];
  testCoverage: number;
  pipeline: PipelineStep[];
  rollbackLogs: RollbackLog[];
  releaseNotes: string;
  approvalStatus?: ApprovalStatus;
  approvers: Approver[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Release extends AggregateRoot<ReleaseProps> {
  private constructor(props: ReleaseProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get version(): string {
    return this.props.version;
  }

  get buildId(): string {
    return this.props.buildId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get platform(): Platform {
    return this.props.platform;
  }

  get status(): ReleaseStatus {
    return this.props.status;
  }

  get releaseDate(): Date | undefined {
    return this.props.releaseDate;
  }

  get plannedDate(): Date | undefined {
    return this.props.plannedDate;
  }

  get features(): LinkedFeature[] {
    return this.props.features;
  }

  get bugFixes(): LinkedBugFix[] {
    return this.props.bugFixes;
  }

  get testCoverage(): number {
    return this.props.testCoverage;
  }

  get pipeline(): PipelineStep[] {
    return this.props.pipeline;
  }

  get rollbackLogs(): RollbackLog[] {
    return this.props.rollbackLogs;
  }

  get releaseNotes(): string {
    return this.props.releaseNotes;
  }

  get approvalStatus(): ApprovalStatus | undefined {
    return this.props.approvalStatus;
  }

  get approvers(): Approver[] {
    return this.props.approvers;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(
    version?: string,
    buildId?: string,
    plannedDate?: Date,
    releaseNotes?: string
  ): void {
    if (version) this.props.version = version;
    if (buildId) this.props.buildId = buildId;
    if (plannedDate) this.props.plannedDate = plannedDate;
    if (releaseNotes !== undefined) this.props.releaseNotes = releaseNotes;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: ReleaseStatus): void {
    this.props.status = status;
    if (status === "released") {
      this.props.releaseDate = new Date();
    }
    this.props.updatedAt = new Date();
  }

  public startPipelineStage(stage: PipelineStage): void {
    const step = this.props.pipeline.find((s) => s.stage === stage);
    if (step) {
      step.status = "running";
      step.startedAt = new Date();
      this.props.updatedAt = new Date();
    }
  }

  public completePipelineStage(
    stage: PipelineStage,
    success: boolean,
    logs?: string
  ): void {
    const step = this.props.pipeline.find((s) => s.stage === stage);
    if (step) {
      step.status = success ? "passed" : "failed";
      step.completedAt = new Date();
      if (logs) step.logs = logs;
      this.props.updatedAt = new Date();
    }
  }

  public retryPipelineStage(stage: PipelineStage): void {
    const step = this.props.pipeline.find((s) => s.stage === stage);
    if (step) {
      step.status = "pending";
      step.startedAt = undefined;
      step.completedAt = undefined;
      this.props.updatedAt = new Date();
    }
  }

  public addRollbackLog(
    version: string,
    reason: string,
    rolledBackBy: string,
    notes?: string
  ): void {
    const log: RollbackLog = {
      id: uuidv4(),
      version,
      reason,
      rolledBackAt: new Date(),
      rolledBackBy,
      notes,
    };
    this.props.rollbackLogs.push(log);
    this.props.status = "rolled_back";
    this.props.updatedAt = new Date();
  }

  public updateReleaseNotes(notes: string): void {
    this.props.releaseNotes = notes;
    this.props.updatedAt = new Date();
  }

  public linkFeature(featureId: string, featureTitle: string): void {
    if (!this.props.features.find((f) => f.featureId === featureId)) {
      this.props.features.push({ featureId, featureTitle });
      this.props.updatedAt = new Date();
    }
  }

  public unlinkFeature(featureId: string): boolean {
    const index = this.props.features.findIndex(
      (f) => f.featureId === featureId
    );
    if (index === -1) return false;
    this.props.features.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public linkBugFix(bugId: string, bugTitle: string): void {
    if (!this.props.bugFixes.find((b) => b.bugId === bugId)) {
      this.props.bugFixes.push({ bugId, bugTitle });
      this.props.updatedAt = new Date();
    }
  }

  public unlinkBugFix(bugId: string): boolean {
    const index = this.props.bugFixes.findIndex((b) => b.bugId === bugId);
    if (index === -1) return false;
    this.props.bugFixes.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public requestApproval(approverIds: string[], approverNames: string[]): void {
    this.props.approvers = approverIds.map((id, index) => ({
      userId: id,
      userName: approverNames[index],
      status: "pending",
    }));
    this.props.approvalStatus = "pending";
    this.props.updatedAt = new Date();
  }

  public approve(userId: string, comment?: string): boolean {
    const approver = this.props.approvers.find((a) => a.userId === userId);
    if (!approver) return false;

    approver.status = "approved";
    approver.comment = comment;
    approver.approvedAt = new Date();

    // Check if all approved
    const allApproved = this.props.approvers.every(
      (a) => a.status === "approved"
    );
    if (allApproved) {
      this.props.approvalStatus = "approved";
    }

    this.props.updatedAt = new Date();
    return true;
  }

  public reject(userId: string, reason: string): boolean {
    const approver = this.props.approvers.find((a) => a.userId === userId);
    if (!approver) return false;

    approver.status = "rejected";
    approver.comment = reason;
    approver.approvedAt = new Date();
    this.props.approvalStatus = "rejected";
    this.props.updatedAt = new Date();
    return true;
  }

  private static initializePipeline(): PipelineStep[] {
    const stages: PipelineStage[] = [
      "build",
      "unit_tests",
      "integration_tests",
      "security_scan",
      "staging_deploy",
      "production_deploy",
    ];

    return stages.map((stage) => ({
      stage,
      status: "pending" as PipelineStatus,
    }));
  }

  public static create(
    props: {
      version: string;
      buildId: string;
      productId: string;
      productName: string;
      platform: Platform;
      workspaceId: string;
      plannedDate?: Date;
      releaseNotes?: string;
      status?: ReleaseStatus;
      testCoverage?: number;
    },
    id?: string
  ): Release {
    return new Release(
      {
        version: props.version,
        buildId: props.buildId,
        productId: props.productId,
        productName: props.productName,
        platform: props.platform,
        status: props.status || "planning",
        plannedDate: props.plannedDate,
        features: [],
        bugFixes: [],
        testCoverage: props.testCoverage || 0,
        pipeline: this.initializePipeline(),
        rollbackLogs: [],
        releaseNotes: props.releaseNotes || "",
        approvers: [],
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
