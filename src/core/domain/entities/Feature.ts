import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum FeatureStatus {
  IDEA = 'idea',
  REVIEW = 'review',
  APPROVED = 'approved',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  RELEASE = 'release',
  LIVE = 'live',
  REJECTED = 'rejected', // New status
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface FeatureProps {
  workspaceId: string;
  productId: string;
  title: string;
  description?: string;
  status: FeatureStatus;
  priority: Priority;
  assigneeId?: string;
  sprintId?: string;
  estimatedHours?: number;
  actualHours?: number;
  votes: number;
  votedBy: string[]; // New: Track who voted
  approvedBy?: string; // New: Who approved
  approvedAt?: Date; // New: When approved
  approvalComment?: string; // New: Approval comment
  rejectedBy?: string; // New: Who rejected
  rejectedAt?: Date; // New: When rejected
  rejectionReason?: string; // New: Rejection reason
  tags: string[];
  metadata: Record<string, any>;
  completedAt?: Date;
}

export class Feature extends BaseEntity<FeatureProps> {
  private constructor(
    id: string,
    private props: FeatureProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    productId: string,
    title: string,
    description?: string,
    id?: string
  ): Feature {
    if (!title || title.trim().length < 5) {
      throw new ValidationError('Feature title must be at least 5 characters long');
    }

    return new Feature(id || crypto.randomUUID(), {
      workspaceId,
      productId,
      title: title.trim(),
      description: description?.trim(),
      status: FeatureStatus.IDEA,
      priority: Priority.MEDIUM,
      votes: 0,
      votedBy: [], // Initialize empty array
      tags: [],
      metadata: {},
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    productId: string,
    title: string,
    description: string | null,
    status: FeatureStatus,
    priority: Priority,
    assigneeId: string | null,
    sprintId: string | null,
    estimatedHours: number | null,
    actualHours: number | null,
    votes: number,
    votedBy: string[], // New parameter
    approvedBy: string | null, // New parameter
    approvedAt: Date | null, // New parameter
    approvalComment: string | null, // New parameter
    rejectedBy: string | null, // New parameter
    rejectedAt: Date | null, // New parameter
    rejectionReason: string | null, // New parameter
    tags: string[],
    metadata: Record<string, any>,
    completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): Feature {
    return new Feature(
      id,
      {
        workspaceId,
        productId,
        title,
        description: description || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        sprintId: sprintId || undefined,
        estimatedHours: estimatedHours || undefined,
        actualHours: actualHours || undefined,
        votes,
        votedBy: votedBy || [],
        approvedBy: approvedBy || undefined,
        approvedAt: approvedAt || undefined,
        approvalComment: approvalComment || undefined,
        rejectedBy: rejectedBy || undefined,
        rejectedAt: rejectedAt || undefined,
        rejectionReason: rejectionReason || undefined,
        tags,
        metadata,
        completedAt: completedAt || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  update(data: {
    title?: string;
    description?: string;
    priority?: Priority;
    estimatedHours?: number;
    tags?: string[];
  }): void {
    if (data.title) {
      if (data.title.trim().length < 5) {
        throw new ValidationError('Feature title must be at least 5 characters long');
      }
      this.props.title = data.title.trim();
    }

    if (data.description !== undefined) {
      this.props.description = data.description.trim() || undefined;
    }

    if (data.priority) {
      if (!Object.values(Priority).includes(data.priority)) {
        throw new ValidationError(`Invalid priority: ${data.priority}`);
      }
      this.props.priority = data.priority;
    }

    if (data.estimatedHours !== undefined) {
      if (data.estimatedHours < 0) {
        throw new ValidationError('Estimated hours cannot be negative');
      }
      this.props.estimatedHours = data.estimatedHours;
    }

    if (data.tags) {
      this.props.tags = data.tags;
    }

    this.touch();
  }

  changeStatus(status: FeatureStatus): void {
    if (!Object.values(FeatureStatus).includes(status)) {
      throw new ValidationError(`Invalid feature status: ${status}`);
    }

    this.props.status = status;

    if (status === FeatureStatus.LIVE) {
      this.props.completedAt = new Date();
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

  /**
   * Vote for feature
   * Updated to track who voted
   */
  vote(userId: string): void {
    if (this.props.votedBy.includes(userId)) {
      throw new ValidationError('User already voted for this feature');
    }
    this.props.votes += 1;
    this.props.votedBy.push(userId);
    this.touch();
  }

  /**
   * Remove vote from feature
   * New method for unvoting
   */
  unvote(userId: string): void {
    if (!this.props.votedBy.includes(userId)) {
      throw new ValidationError('User has not voted for this feature');
    }
    if (this.props.votes > 0) {
      this.props.votes -= 1;
      this.props.votedBy = this.props.votedBy.filter((id) => id !== userId);
      this.touch();
    }
  }

  /**
   * Approve feature
   * Updated to track who approved and optional comment
   */
  approve(userId?: string, comment?: string): void {
    if (this.props.status !== FeatureStatus.REVIEW) {
      throw new ValidationError('Only features in review can be approved');
    }
    this.props.status = FeatureStatus.APPROVED;
    this.props.approvedBy = userId;
    this.props.approvedAt = new Date();
    this.props.approvalComment = comment;
    this.touch();
  }

  /**
   * Reject feature
   * New method for rejection
   */
  reject(userId: string, reason: string): void {
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Rejection reason must be at least 10 characters');
    }
    this.props.status = FeatureStatus.REJECTED;
    this.props.rejectedBy = userId;
    this.props.rejectedAt = new Date();
    this.props.rejectionReason = reason.trim();
    this.touch();
  }

  logTime(hours: number): void {
    if (hours <= 0) {
      throw new ValidationError('Hours must be positive');
    }
    this.props.actualHours = (this.props.actualHours || 0) + hours;
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get productId(): string {
    return this.props.productId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get status(): FeatureStatus {
    return this.props.status;
  }
  get priority(): Priority {
    return this.props.priority;
  }
  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }
  get sprintId(): string | undefined {
    return this.props.sprintId;
  }
  get estimatedHours(): number | undefined {
    return this.props.estimatedHours;
  }
  get actualHours(): number | undefined {
    return this.props.actualHours;
  }
  get votes(): number {
    return this.props.votes;
  }
  get votedBy(): string[] {
    return [...this.props.votedBy]; // New getter
  }
  get approvedBy(): string | undefined {
    return this.props.approvedBy; // New getter
  }
  get approvedAt(): Date | undefined {
    return this.props.approvedAt; // New getter
  }
  get approvalComment(): string | undefined {
    return this.props.approvalComment; // New getter
  }
  get rejectedBy(): string | undefined {
    return this.props.rejectedBy; // New getter
  }
  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt; // New getter
  }
  get rejectionReason(): string | undefined {
    return this.props.rejectionReason; // New getter
  }
  get tags(): string[] {
    return [...this.props.tags];
  }
  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }
  get metadata(): Record<string, any> {
    return this.props.metadata;
  }

  isCompleted(): boolean {
    return this.props.status === FeatureStatus.LIVE;
  }

  isApproved(): boolean {
    return this.props.status === FeatureStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.props.status === FeatureStatus.REJECTED;
  }
}
