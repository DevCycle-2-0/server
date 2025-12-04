import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

interface TimeLogProps {
  taskId: string;
  userId: string;
  hours: number;
  date: Date;
  description?: string;
}

export class TimeLog extends BaseEntity<TimeLogProps> {
  private constructor(
    id: string,
    private props: TimeLogProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    taskId: string,
    userId: string,
    hours: number,
    date: Date,
    description?: string,
    id?: string
  ): TimeLog {
    if (hours <= 0 || hours > 24) {
      throw new ValidationError('Hours must be between 0 and 24');
    }

    if (date > new Date()) {
      throw new ValidationError('Cannot log time in the future');
    }

    return new TimeLog(id || crypto.randomUUID(), {
      taskId,
      userId,
      hours,
      date,
      description: description?.trim(),
    });
  }

  static reconstitute(
    id: string,
    taskId: string,
    userId: string,
    hours: number,
    date: Date,
    description: string | null,
    createdAt: Date
  ): TimeLog {
    return new TimeLog(
      id,
      {
        taskId,
        userId,
        hours,
        date,
        description: description || undefined,
      },
      createdAt,
      createdAt
    );
  }

  // Getters
  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get hours(): number {
    return this.props.hours;
  }

  get date(): Date {
    return this.props.date;
  }

  get description(): string | undefined {
    return this.props.description;
  }
}
