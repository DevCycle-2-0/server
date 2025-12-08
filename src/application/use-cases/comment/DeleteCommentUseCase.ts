import { CommentModel } from '@infrastructure/database/models/CommentModel';
import { NotFoundError } from '@shared/errors/AppError';

export class DeleteCommentUseCase {
  async execute(commentId: string, userId: string) {
    const comment = await CommentModel.findByPk(commentId);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized to delete this comment');
    }

    await comment.destroy();
  }
}
