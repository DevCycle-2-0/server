import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum CommentableType {
  FEATURE = 'feature',
  TASK = 'task',
  BUG = 'bug',
}

interface CommentProps {
  workspaceId: string;
  authorId: string;
  entityType: CommentableType;
  entityId: string;
  content: string;
  parentId?: string;
  isEdited: boolean;
  editedAt?: Date;
}

export class Comment extends BaseEntity<CommentProps> {
  private constructor(
    id: string,
    private props: CommentProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    authorId: string,
    entityType: CommentableType,
    entityId: string,
    content: string,
    parentId?: string,
    id?: string
  ): Comment {
    if (!content || content.trim().length < 1) {
      throw new ValidationError('Comment content cannot be empty');
    }

    return new Comment(id || crypto.randomUUID(), {
      workspaceId,
      authorId,
      entityType,
      entityId,
      content: content.trim(),
      parentId,
      isEdited: false,
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    authorId: string,
    entityType: CommentableType,
    entityId: string,
    content: string,
    parentId: string | null,
    isEdited: boolean,
    editedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): Comment {
    return new Comment(
      id,
      {
        workspaceId,
        authorId,
        entityType,
        entityId,
        content,
        parentId: parentId || undefined,
        isEdited,
        editedAt: editedAt || undefined,
      },
      createdAt,
      updatedAt
    );
  }

  updateContent(content: string): void {
    if (!content || content.trim().length < 1) {
      throw new ValidationError('Comment content cannot be empty');
    }
    this.props.content = content.trim();
    this.props.isEdited = true;
    this.props.editedAt = new Date();
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get authorId(): string {
    return this.props.authorId;
  }
  get entityType(): CommentableType {
    return this.props.entityType;
  }
  get entityId(): string {
    return this.props.entityId;
  }
  get content(): string {
    return this.props.content;
  }
  get parentId(): string | undefined {
    return this.props.parentId;
  }
  get isEdited(): boolean {
    return this.props.isEdited;
  }
  get editedAt(): Date | undefined {
    return this.props.editedAt;
  }
}
