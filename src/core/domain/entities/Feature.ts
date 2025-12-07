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
  REJECTED = 'rejected',
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
  businessValue?: string; // ✅ ADDED
  targetUsers?: string; // ✅ ADDED
  requesterId: string; // ✅ ADDED (required)
  status: FeatureStatus;
  priority: Priority;
  assigneeId?: string;
  sprintId?: string;
  estimatedHours?: number;
  actualHours?: number;
  votes: number;
  votedBy: string[];
  approvedBy?: string;
  approvedAt?: Date;
  approvalComment?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  attachments: string[]; // ✅ ADDED
  targetVersion?: string; // ✅ ADDED
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
    requesterId?: string, // ✅ ADDED - defaults to system if not provided
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
      requesterId: requesterId || 'system', // ✅ ADDED
      status: FeatureStatus.IDEA,
      priority: Priority.MEDIUM,
      votes: 0,
      votedBy: [],
      attachments: [], // ✅ ADDED
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
    businessValue: string | null, // ✅ ADDED
    targetUsers: string | null, // ✅ ADDED
    requesterId: string, // ✅ ADDED
    status: FeatureStatus,
    priority: Priority,
    assigneeId: string | null,
    sprintId: string | null,
    estimatedHours: number | null,
    actualHours: number | null,
    votes: number,
    votedBy: string[],
    approvedBy: string | null,
    approvedAt: Date | null,
    approvalComment: string | null,
    rejectedBy: string | null,
    rejectedAt: Date | null,
    rejectionReason: string | null,
    attachments: string[], // ✅ ADDED
    targetVersion: string | null, // ✅ ADDED
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
        businessValue: businessValue || undefined, // ✅ ADDED
        targetUsers: targetUsers || undefined, // ✅ ADDED
        requesterId, // ✅ ADDED
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
        attachments: attachments || [], // ✅ ADDED
        targetVersion: targetVersion || undefined, // ✅ ADDED
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
    businessValue?: string; // ✅ ADDED
    targetUsers?: string; // ✅ ADDED
    priority?: Priority;
    estimatedHours?: number;
    targetVersion?: string; // ✅ ADDED
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

    // ✅ ADDED
    if (data.businessValue !== undefined) {
      this.props.businessValue = data.businessValue.trim() || undefined;
    }

    // ✅ ADDED
    if (data.targetUsers !== undefined) {
      this.props.targetUsers = data.targetUsers.trim() || undefined;
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

    // ✅ ADDED
    if (data.targetVersion !== undefined) {
      this.props.targetVersion = data.targetVersion;
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

  vote(userId: string): void {
    if (this.props.votedBy.includes(userId)) {
      throw new ValidationError('User already voted for this feature');
    }
    this.props.votes += 1;
    this.props.votedBy.push(userId);
    this.touch();
  }

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

  // ✅ ADDED - Attachment management
  addAttachment(url: string): void {
    if (!url || !url.trim()) {
      throw new ValidationError('Attachment URL cannot be empty');
    }
    this.props.attachments.push(url.trim());
    this.touch();
  }

  // ✅ ADDED
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
  get title(): string {
    return this.props.title;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  // ✅ ADDED
  get businessValue(): string | undefined {
    return this.props.businessValue;
  }
  // ✅ ADDED
  get targetUsers(): string | undefined {
    return this.props.targetUsers;
  }
  // ✅ ADDED
  get requesterId(): string {
    return this.props.requesterId;
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
    return [...this.props.votedBy];
  }
  get approvedBy(): string | undefined {
    return this.props.approvedBy;
  }
  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }
  get approvalComment(): string | undefined {
    return this.props.approvalComment;
  }
  get rejectedBy(): string | undefined {
    return this.props.rejectedBy;
  }
  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt;
  }
  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }
  // ✅ ADDED
  get attachments(): string[] {
    return [...this.props.attachments];
  }
  // ✅ ADDED
  get targetVersion(): string | undefined {
    return this.props.targetVersion;
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
