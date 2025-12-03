export enum FeatureStatus {
  IDEA = 'idea',
  REVIEW = 'review',
  APPROVED = 'approved',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  RELEASE = 'release',
  LIVE = 'live',
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
  tags: string[];
  metadata: Record<string, any>;
  completedAt?: Date;
}

export class Feature extends BaseEntity<FeatureProps> {
  private constructor(id: string, private props: FeatureProps, createdAt?: Date, updatedAt?: Date) {
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

  vote(): void {
    this.props.votes += 1;
    this.touch();
  }

  unvote(): void {
    if (this.props.votes > 0) {
      this.props.votes -= 1;
      this.touch();
    }
  }

  approve(): void {
    if (this.props.status !== FeatureStatus.REVIEW) {
      throw new ValidationError('Only features in review can be approved');
    }
    this.props.status = FeatureStatus.APPROVED;
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

  get tags(): string[] {
    return [...this.props.tags];
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  isCompleted(): boolean {
    return this.props.status === FeatureStatus.LIVE;
  }
}
