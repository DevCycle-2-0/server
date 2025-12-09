import { Entity } from "@shared/domain/Entity";
import { v4 as uuidv4 } from "uuid";

interface TimeLogProps {
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: Date;
  description?: string;
  createdAt: Date;
}

export class TimeLog extends Entity<TimeLogProps> {
  private constructor(props: TimeLogProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get userName(): string {
    return this.props.userName;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public static create(
    props: {
      taskId: string;
      userId: string;
      userName: string;
      hours: number;
      date: Date;
      description?: string;
    },
    id?: string
  ): TimeLog {
    return new TimeLog(
      {
        taskId: props.taskId,
        userId: props.userId,
        userName: props.userName,
        hours: props.hours,
        date: props.date,
        description: props.description,
        createdAt: new Date(),
      },
      id
    );
  }
}
