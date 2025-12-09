import { Comment } from "@modules/tasks/domain/entities/Comment";
import { ICommentRepository } from "@modules/tasks/domain/repositories/ICommentRepository";
import { CommentModel } from "../models/CommentModel";
import { BaseRepository } from "@shared/infrastructure/BaseRepository";

export class CommentRepository
  extends BaseRepository<Comment, CommentModel>
  implements ICommentRepository
{
  constructor() {
    super(CommentModel);
  }

  protected toDomain(model: CommentModel): Comment {
    return Comment.create(
      {
        taskId: model.taskId,
        userId: model.userId,
        userName: model.userName,
        userAvatar: model.userAvatar,
        content: model.content,
      },
      model.id
    );
  }

  protected toModel(domain: Comment): Partial<CommentModel> {
    return {
      id: domain.id,
      taskId: domain.taskId,
      userId: domain.userId,
      userName: domain.userName,
      userAvatar: domain.userAvatar,
      content: domain.content,
    };
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const models = await this.model.findAll({
      where: { taskId },
      order: [["createdAt", "ASC"]],
    });
    return models.map((model) => this.toDomain(model));
  }
}
