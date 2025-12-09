import { Entity } from "@shared/domain/Entity";
import { v4 as uuidv4 } from "uuid";

interface CommentProps {
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment extends Entity<CommentProps> {
  private constructor(props: CommentProps, id?: string) {
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

  get userAvatar(): string | undefined {
    return this.props.userAvatar;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(content: string): void {
    this.props.content = content;
    this.props.updatedAt = new Date();
  }

  public static create(
    props: {
      taskId: string;
      userId: string;
      userName: string;
      userAvatar?: string;
      content: string;
    },
    id?: string
  ): Comment {
    return new Comment(
      {
        taskId: props.taskId,
        userId: props.userId,
        userName: props.userName,
        userAvatar: props.userAvatar,
        content: props.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }
}
