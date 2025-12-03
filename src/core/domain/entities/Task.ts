import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';
import { Priority } from './Feature';

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  CODE_REVIEW = 'code_review',
  QA_TESTING = 'qa_testing',
  DONE = 'done',
}

interface TaskProps {
  workspaceId: string;
  sprintId?: string;
  featureId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  isBlocked: boolean;
  blockedReason?: string;
  tags: string[];
  metadata: Record<string, any>;
  completedAt?: Date;
}

export class Task extends BaseEntity<TaskProps> {
  private constructor(id: string, private props: TaskProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    title: string,
    description?: string,
    featureId?: string,
    sprintId?: string,
    id?: string
  ): Task {
    if (!title || title.trim().length < 3) {
      throw new ValidationError('Task title must be at least 3 characters long');
    }

    return new Task(id || crypto.randomUUID(), {
      workspaceId,
      sprintId,
      featureId,
      title: title.trim(),
      description: description?.trim(),
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      isBlocked: false,
      tags: [],
      metadata: {},
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    sprintId: string | null,
    featureId: string | null,
    title: string,
    description: string | null,
    status: TaskStatus,
    priority: Priority,
    assigneeId: string | null,
    estimatedHours: number | null,
    actualHours: number | null,
    isBlocked: boolean,
    blockedReason: string | null,
    tags: string[],
    metadata: Record<string, any>,
    completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): Task {
    return new Task(
      id,
      {
        workspaceId,
        sprintId: sprintId || undefined,
        featureId: featureId || undefined,
        title,
        description: description || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        estimatedHours: estimatedHours || undefined,
        actualHours: actualHours || undefined,
        isBlocked,
        blockedReason: blockedReason || undefined,
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
      if (data.title.trim().length < 3) {
        throw new ValidationError('Task title must be at least 3 characters long');
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

  changeStatus(status: TaskStatus): void {
    if (!Object.values(TaskStatus).includes(status)) {
      throw new ValidationError(`Invalid task status: ${status}`);
    }

    this.props.status = status;

    if (status === TaskStatus.DONE) {
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

  block(reason: string): void {
    if (!reason || reason.trim().length < 5) {
      throw new ValidationError('Block reason must be at least 5 characters long');
    }
    this.props.isBlocked = true;
    this.props.blockedReason = reason.trim();
    this.touch();
  }

  unblock(): void {
    this.props.isBlocked = false;
    this.props.blockedReason = undefined;
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

  linkToFeature(featureId: string): void {
    this.props.featureId = featureId;
    this.touch();
  }

  unlinkFromFeature(): void {
    this.props.featureId = undefined;
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

  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get featureId(): string | undefined {
    return this.props.featureId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get estimatedHours(): number | undefined {
    return this.props.estimatedHours;
  }

  get actualHours(): number | undefined {
    return this.props.actualHours;
  }

  get isBlocked(): boolean {
    return this.props.isBlocked;
  }

  get blockedReason(): string | undefined {
    return this.props.blockedReason;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  isCompleted(): boolean {
    return this.props.status === TaskStatus.DONE;
  }

  isInProgress(): boolean {
    return this.props.status === TaskStatus.IN_PROGRESS;
  }
}
