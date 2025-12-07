export class Comment {
  constructor(
    public id: string,
    public workspaceId: string,
    public entityType: string,
    public entityId: string,
    public authorId: string,
    public content: string,
    public parentId?: string,
    public mentions: string[] = [],
    public attachments: any[] = [],
    public editedAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(
    id: string,
    workspaceId: string,
    entityType: string,
    entityId: string,
    authorId: string,
    content: string
  ): Comment {
    return new Comment(
      id,
      workspaceId,
      entityType,
      entityId,
      authorId,
      content
    );
  }

  edit(newContent: string): void {
    this.content = newContent;
    this.editedAt = new Date();
    this.updatedAt = new Date();
  }
}
