import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "@modules/products/domain/entities/Product";
import { Priority } from "@modules/features/domain/entities/Feature";

export type BugStatus =
  | "new"
  | "confirmed"
  | "in_progress"
  | "fixed"
  | "verified"
  | "closed"
  | "reopened"
  | "wont_fix"
  | "duplicate";

export type BugSeverity = "low" | "medium" | "high" | "critical";

export interface BugRetestResult {
  id: string;
  status: "passed" | "failed";
  testedBy: string;
  testedByName: string;
  notes?: string;
  environment: string;
  testedAt: Date;
}

interface BugProps {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  environment: string;
  version?: string;
  browserInfo?: string;
  retestResults: BugRetestResult[];
  duplicateOf?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export class Bug extends AggregateRoot<BugProps> {
  private constructor(props: BugProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get stepsToReproduce(): string {
    return this.props.stepsToReproduce;
  }

  get expectedBehavior(): string {
    return this.props.expectedBehavior;
  }

  get actualBehavior(): string {
    return this.props.actualBehavior;
  }

  get status(): BugStatus {
    return this.props.status;
  }

  get severity(): BugSeverity {
    return this.props.severity;
  }

  get priority(): Priority {
    return this.props.priority;
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

  get featureId(): string | undefined {
    return this.props.featureId;
  }

  get featureTitle(): string | undefined {
    return this.props.featureTitle;
  }

  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get sprintName(): string | undefined {
    return this.props.sprintName;
  }

  get reporterId(): string {
    return this.props.reporterId;
  }

  get reporterName(): string {
    return this.props.reporterName;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get assigneeName(): string | undefined {
    return this.props.assigneeName;
  }

  get environment(): string {
    return this.props.environment;
  }

  get version(): string | undefined {
    return this.props.version;
  }

  get browserInfo(): string | undefined {
    return this.props.browserInfo;
  }

  get retestResults(): BugRetestResult[] {
    return this.props.retestResults;
  }

  get duplicateOf(): string | undefined {
    return this.props.duplicateOf;
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

  get resolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  public update(
    title?: string,
    description?: string,
    severity?: BugSeverity,
    priority?: Priority,
    stepsToReproduce?: string,
    expectedBehavior?: string,
    actualBehavior?: string
  ): void {
    if (title) this.props.title = title;
    if (description !== undefined) this.props.description = description;
    if (severity) this.props.severity = severity;
    if (priority) this.props.priority = priority;
    if (stepsToReproduce) this.props.stepsToReproduce = stepsToReproduce;
    if (expectedBehavior) this.props.expectedBehavior = expectedBehavior;
    if (actualBehavior) this.props.actualBehavior = actualBehavior;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: BugStatus): void {
    this.props.status = status;
    if (["fixed", "verified", "closed", "wont_fix"].includes(status)) {
      this.props.resolvedAt = new Date();
    } else if (status === "reopened") {
      this.props.resolvedAt = undefined;
    }
    this.props.updatedAt = new Date();
  }

  public assign(assigneeId: string, assigneeName: string): void {
    this.props.assigneeId = assigneeId;
    this.props.assigneeName = assigneeName;
    this.props.updatedAt = new Date();
  }

  public unassign(): void {
    this.props.assigneeId = undefined;
    this.props.assigneeName = undefined;
    this.props.updatedAt = new Date();
  }

  public linkToFeature(featureId: string, featureTitle: string): void {
    this.props.featureId = featureId;
    this.props.featureTitle = featureTitle;
    this.props.updatedAt = new Date();
  }

  public unlinkFromFeature(): void {
    this.props.featureId = undefined;
    this.props.featureTitle = undefined;
    this.props.updatedAt = new Date();
  }

  public addToSprint(sprintId: string, sprintName: string): void {
    this.props.sprintId = sprintId;
    this.props.sprintName = sprintName;
    this.props.updatedAt = new Date();
  }

  public removeFromSprint(): void {
    this.props.sprintId = undefined;
    this.props.sprintName = undefined;
    this.props.updatedAt = new Date();
  }

  public addRetestResult(
    status: "passed" | "failed",
    testedBy: string,
    testedByName: string,
    environment: string,
    notes?: string
  ): BugRetestResult {
    const result: BugRetestResult = {
      id: uuidv4(),
      status,
      testedBy,
      testedByName,
      notes,
      environment,
      testedAt: new Date(),
    };
    this.props.retestResults.push(result);
    this.props.updatedAt = new Date();
    return result;
  }

  public markAsDuplicate(duplicateOfId: string): void {
    this.props.duplicateOf = duplicateOfId;
    this.props.status = "duplicate";
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public static create(
    props: {
      title: string;
      description: string;
      stepsToReproduce: string;
      expectedBehavior: string;
      actualBehavior: string;
      severity: BugSeverity;
      priority: Priority;
      productId: string;
      productName: string;
      platform: Platform;
      reporterId: string;
      reporterName: string;
      environment: string;
      workspaceId: string;
      status?: BugStatus;
      featureId?: string;
      featureTitle?: string;
      sprintId?: string;
      sprintName?: string;
      assigneeId?: string;
      assigneeName?: string;
      version?: string;
      browserInfo?: string;
    },
    id?: string
  ): Bug {
    return new Bug(
      {
        title: props.title,
        description: props.description,
        stepsToReproduce: props.stepsToReproduce,
        expectedBehavior: props.expectedBehavior,
        actualBehavior: props.actualBehavior,
        status: props.status || "new",
        severity: props.severity,
        priority: props.priority,
        productId: props.productId,
        productName: props.productName,
        platform: props.platform,
        featureId: props.featureId,
        featureTitle: props.featureTitle,
        sprintId: props.sprintId,
        sprintName: props.sprintName,
        reporterId: props.reporterId,
        reporterName: props.reporterName,
        assigneeId: props.assigneeId,
        assigneeName: props.assigneeName,
        environment: props.environment,
        version: props.version,
        browserInfo: props.browserInfo,
        retestResults: [],
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
