import { Comment, CommentableType } from '@core/domain/entities/Comment';
import { CommentModel } from '../models/CommentModel';

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByEntity(entityType: CommentableType, entityId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  update(comment: Comment): Promise<void>;
  delete(id: string): Promise<void>;
}

export class CommentRepository implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    const model = await CommentModel.findByPk(id);
    if (!model) return null;

    return Comment.reconstitute(
      model.id,
      model.workspace_id,
      model.author_id,
      model.entity_type as CommentableType,
      model.entity_id,
      model.content,
      model.parent_id || null,
      model.is_edited,
      model.edited_at || null,
      model.created_at,
      model.updated_at
    );
  }

  async findByEntity(entityType: CommentableType, entityId: string): Promise<Comment[]> {
    const models = await CommentModel.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      order: [['created_at', 'ASC']],
    });

    return models.map((m) =>
      Comment.reconstitute(
        m.id,
        m.workspace_id,
        m.author_id,
        m.entity_type as CommentableType,
        m.entity_id,
        m.content,
        m.parent_id || null,
        m.is_edited,
        m.edited_at || null,
        m.created_at,
        m.updated_at
      )
    );
  }

  async save(comment: Comment): Promise<void> {
    await CommentModel.create({
      id: comment.id,
      workspace_id: comment.workspaceId,
      author_id: comment.authorId,
      entity_type: comment.entityType,
      entity_id: comment.entityId,
      content: comment.content,
      parent_id: comment.parentId,
      is_edited: comment.isEdited,
      edited_at: comment.editedAt,
    });
  }

  async update(comment: Comment): Promise<void> {
    await CommentModel.update(
      {
        content: comment.content,
        is_edited: comment.isEdited,
        edited_at: comment.editedAt,
        updated_at: comment.updatedAt,
      },
      { where: { id: comment.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await CommentModel.destroy({ where: { id } });
  }
}
