import { v4 as uuidv4 } from "uuid";
import { Comment } from "@domain/entities/Comment";
import { CommentModel } from "@infrastructure/database/models/CommentModel";

export class CreateCommentUseCase {
  async execute(
    workspaceId: string,
    entityType: string,
    entityId: string,
    authorId: string,
    content: string,
    parentId?: string,
    mentions?: string[]
  ) {
    const commentId = uuidv4();
    const comment = Comment.create(
      commentId,
      workspaceId,
      entityType,
      entityId,
      authorId,
      content
    );

    if (parentId) comment.parentId = parentId;
    if (mentions) comment.mentions = mentions;

    const created = await CommentModel.create({
      id: comment.id,
      workspaceId: comment.workspaceId,
      entityType: comment.entityType,
      entityId: comment.entityId,
      authorId: comment.authorId,
      content: comment.content,
      parentId: comment.parentId,
      mentions: comment.mentions,
      attachments: comment.attachments,
    });

    return created;
  }
}
