import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum BugStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  IN_PROGRESS = 'in_progress',
  FIXED = 'fixed',
  RETEST = 'retest',
  CLOSED = 'closed',
  WONTFIX = 'wontfix',
}

export enum BugSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
  BLOCKER = 'blocker',
}

interface BugProps {
  workspaceId: string;
  productId: string;
  sprintId?: string;
  featureId?: string; // Added for feature linking
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  status: BugStatus;
  severity: BugSeverity;
  environment?: string;
  browser?: string;
  os?: string;
  reporterId: string;
  assigneeId?: string;
  attachments: string[];
  tags: string[];
  metadata: Record<string, any>;
  resolvedAt?: Date;
}

export class Bug extends BaseEntity<BugProps> {
  private constructor(
    id: string,
    private props: BugProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    productId: string,
    title: string,
    description: string,
    severity: BugSeverity,
    reporterId: string,
    id?: string
  ): Bug {
    if (!title || title.trim().length < 5) {
      throw new ValidationError('Bug title must be at least 5 characters long');
    }

    if (!description || description.trim().length < 10) {
      throw new ValidationError('Bug description must be at least 10 characters long');
    }

    if (!Object.values(BugSeverity).includes(severity)) {
      throw new ValidationError(`Invalid bug severity: ${severity}`);
    }

    return new Bug(id || crypto.randomUUID(), {
      workspaceId,
      productId,
      title: title.trim(),
      description: description.trim(),
      status: BugStatus.OPEN,
      severity,
      reporterId,
      attachments: [],
      tags: [],
      metadata: {},
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    productId: string,
    sprintId: string | null,
    featureId: string | null, // Added parameter
    title: string,
    description: string,
    stepsToReproduce: string | null,
    expectedBehavior: string | null,
    actualBehavior: string | null,
    status: BugStatus,
    severity: BugSeverity,
    environment: string | null,
    browser: string | null,
    os: string | null,
    reporterId: string,
    assigneeId: string | null,
    attachments: string[],
    tags: string[],
    metadata: Record<string, any>,
    resolvedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): Bug {
    return new Bug(
      id,
      {
        workspaceId,
        productId,
        sprintId: sprintId || undefined,
        featureId: featureId || undefined, // Added property
        title,
        description,
        stepsToReproduce: stepsToReproduce || undefined,
        expectedBehavior: expectedBehavior || undefined,
        actualBehavior: actualBehavior || undefined,
        status,
        severity,
        environment: environment || undefined,
        browser: browser || undefined,
        os: os || undefined,
        reporterId,
        assigneeId: assigneeId || undefined,
        attachments,
        tags,
        metadata,
        resolvedAt: resolvedAt || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  update(data: {
    title?: string;
    description?: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    severity?: BugSeverity;
    environment?: string;
    browser?: string;
    os?: string;
    tags?: string[];
  }): void {
    if (data.title) {
      if (data.title.trim().length < 5) {
        throw new ValidationError('Bug title must be at least 5 characters long');
      }
      this.props.title = data.title.trim();
    }

    if (data.description) {
      if (data.description.trim().length < 10) {
        throw new ValidationError('Bug description must be at least 10 characters long');
      }
      this.props.description = data.description.trim();
    }

    if (data.stepsToReproduce !== undefined) {
      this.props.stepsToReproduce = data.stepsToReproduce.trim() || undefined;
    }

    if (data.expectedBehavior !== undefined) {
      this.props.expectedBehavior = data.expectedBehavior.trim() || undefined;
    }

    if (data.actualBehavior !== undefined) {
      this.props.actualBehavior = data.actualBehavior.trim() || undefined;
    }

    if (data.severity) {
      if (!Object.values(BugSeverity).includes(data.severity)) {
        throw new ValidationError(`Invalid bug severity: ${data.severity}`);
      }
      this.props.severity = data.severity;
    }

    if (data.environment !== undefined) {
      this.props.environment = data.environment;
    }

    if (data.browser !== undefined) {
      this.props.browser = data.browser;
    }

    if (data.os !== undefined) {
      this.props.os = data.os;
    }

    if (data.tags) {
      this.props.tags = data.tags;
    }

    this.touch();
  }

  changeStatus(status: BugStatus): void {
    if (!Object.values(BugStatus).includes(status)) {
      throw new ValidationError(`Invalid bug status: ${status}`);
    }

    this.props.status = status;

    if (status === BugStatus.CLOSED || status === BugStatus.FIXED) {
      this.props.resolvedAt = new Date();
    }

    this.touch();
  }

  assign(userId: string): void {
    this.props.assigneeId = userId;
    this.touch();
  }

  unassign(): void {
    this.props.assigneeId = undefined;
    this.touch();
  }

  addToSprint(sprintId: string): void {
    this.props.sprintId = sprintId;
    this.touch();
  }

  removeFromSprint(): void {
    this.props.sprintId = undefined;
    this.touch();
  }

  // New methods for feature linking
  linkToFeature(featureId: string): void {
    this.props.featureId = featureId;
    this.touch();
  }

  unlinkFromFeature(): void {
    this.props.featureId = undefined;
    this.touch();
  }

  addAttachment(url: string): void {
    this.props.attachments.push(url);
    this.touch();
  }

  // New method to remove specific attachment
  removeAttachment(url: string): void {
    this.props.attachments = this.props.attachments.filter((a) => a !== url);
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get featureId(): string | undefined {
    return this.props.featureId; // New getter
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get stepsToReproduce(): string | undefined {
    return this.props.stepsToReproduce;
  }

  get expectedBehavior(): string | undefined {
    return this.props.expectedBehavior;
  }

  get actualBehavior(): string | undefined {
    return this.props.actualBehavior;
  }

  get status(): BugStatus {
    return this.props.status;
  }

  get severity(): BugSeverity {
    return this.props.severity;
  }

  get environment(): string | undefined {
    return this.props.environment;
  }

  get browser(): string | undefined {
    return this.props.browser;
  }

  get os(): string | undefined {
    return this.props.os;
  }

  get reporterId(): string {
    return this.props.reporterId;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get attachments(): string[] {
    return [...this.props.attachments];
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get metadata(): Record<string, any> {
    return { ...this.props.metadata };
  }

  get resolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  isResolved(): boolean {
    return this.props.status === BugStatus.CLOSED || this.props.status === BugStatus.FIXED;
  }

  isBlocking(): boolean {
    return this.props.severity === BugSeverity.BLOCKER;
  }
}
