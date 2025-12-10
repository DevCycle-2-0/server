import { Entity } from "@shared/domain/Entity";
import { v4 as uuidv4 } from "uuid";

interface ActivityProps {
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: "task" | "bug" | "feature" | "sprint" | "release";
  entityId: string;
  entityTitle: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class Activity extends Entity<ActivityProps> {
  private constructor(props: ActivityProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get userName(): string {
    return this.props.userName;
  }

  get userAvatar(): string {
    return this.props.userAvatar;
  }

  get entityType(): "task" | "bug" | "feature" | "sprint" | "release" {
    return this.props.entityType;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get entityTitle(): string {
    return this.props.entityTitle;
  }

  get action(): string {
    return this.props.action;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public static create(
    props: {
      workspaceId: string;
      userId: string;
      userName: string;
      userAvatar: string;
      entityType: "task" | "bug" | "feature" | "sprint" | "release";
      entityId: string;
      entityTitle: string;
      action: string;
      metadata?: Record<string, any>;
    },
    id?: string
  ): Activity {
    return new Activity(
      {
        ...props,
        createdAt: new Date(),
      },
      id
    );
  }
}
