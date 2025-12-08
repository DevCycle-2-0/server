import { CommentModel } from '@infrastructure/database/models/CommentModel';
import { NotFoundError } from '@shared/errors/AppError';

export class UpdateCommentUseCase {
  async execute(commentId: string, content: string, userId: string) {
    const comment = await CommentModel.findByPk(commentId);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized to edit this comment');
    }

    comment.content = content;
    comment.editedAt = new Date();
    await comment.save();

    return comment;
  }
}
