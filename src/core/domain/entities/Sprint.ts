import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum SprintStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SprintDuration {
  ONE_WEEK = '1_week',
  TWO_WEEKS = '2_weeks',
  THREE_WEEKS = '3_weeks',
  FOUR_WEEKS = '4_weeks',
}

interface SprintProps {
  workspaceId: string;
  productId: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  duration: SprintDuration;
  startDate: Date;
  endDate: Date;
  velocity: number;
}

export class Sprint extends BaseEntity<SprintProps> {
  private constructor(id: string, private props: SprintProps, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    productId: string,
    name: string,
    startDate: Date,
    duration: SprintDuration,
    goal?: string,
    id?: string
  ): Sprint {
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Sprint name must be at least 3 characters long');
    }

    const durationDays = this.getDurationDays(duration);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    return new Sprint(id || crypto.randomUUID(), {
      workspaceId,
      productId,
      name: name.trim(),
      goal: goal?.trim(),
      status: SprintStatus.PLANNING,
      duration,
      startDate,
      endDate,
      velocity: 0,
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    productId: string,
    name: string,
    goal: string | null,
    status: SprintStatus,
    duration: SprintDuration,
    startDate: Date,
    endDate: Date,
    velocity: number,
    createdAt: Date,
    updatedAt: Date
  ): Sprint {
    return new Sprint(
      id,
      {
        workspaceId,
        productId,
        name,
        goal: goal || undefined,
        status,
        duration,
        startDate,
        endDate,
        velocity,
      },
      createdAt,
      updatedAt
    );
  }

  private static getDurationDays(duration: SprintDuration): number {
    const map: Record<SprintDuration, number> = {
      [SprintDuration.ONE_WEEK]: 7,
      [SprintDuration.TWO_WEEKS]: 14,
      [SprintDuration.THREE_WEEKS]: 21,
      [SprintDuration.FOUR_WEEKS]: 28,
    };
    return map[duration];
  }

  update(data: { name?: string; goal?: string }): void {
    if (this.props.status !== SprintStatus.PLANNING) {
      throw new ValidationError('Only planning sprints can be updated');
    }

    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new ValidationError('Sprint name must be at least 3 characters long');
      }
      this.props.name = data.name.trim();
    }

    if (data.goal !== undefined) {
      this.props.goal = data.goal.trim() || undefined;
    }

    this.touch();
  }

  start(): void {
    if (this.props.status !== SprintStatus.PLANNING) {
      throw new ValidationError('Only planning sprints can be started');
    }

    this.props.status = SprintStatus.ACTIVE;
    this.touch();
  }

  complete(): void {
    if (this.props.status !== SprintStatus.ACTIVE) {
      throw new ValidationError('Only active sprints can be completed');
    }

    this.props.status = SprintStatus.COMPLETED;
    this.touch();
  }

  cancel(): void {
    if (this.props.status === SprintStatus.COMPLETED) {
      throw new ValidationError('Cannot cancel a completed sprint');
    }

    this.props.status = SprintStatus.CANCELLED;
    this.touch();
  }

  updateVelocity(velocity: number): void {
    if (velocity < 0) {
      throw new ValidationError('Velocity cannot be negative');
    }
    this.props.velocity = velocity;
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get productId(): string {
    return this.props.productId;
  }
  get name(): string {
    return this.props.name;
  }
  get goal(): string | undefined {
    return this.props.goal;
  }
  get status(): SprintStatus {
    return this.props.status;
  }
  get duration(): SprintDuration {
    return this.props.duration;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date {
    return this.props.endDate;
  }
  get velocity(): number {
    return this.props.velocity;
  }

  isActive(): boolean {
    return this.props.status === SprintStatus.ACTIVE;
  }

  isCompleted(): boolean {
    return this.props.status === SprintStatus.COMPLETED;
  }

  getDaysRemaining(): number {
    if (!this.isActive()) return 0;
    const now = new Date();
    const diff = this.props.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
