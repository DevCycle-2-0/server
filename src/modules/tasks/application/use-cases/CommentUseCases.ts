import { ICommentRepository } from "@modules/tasks/domain/repositories/ICommentRepository";
import { Comment } from "@modules/tasks/domain/entities/Comment";
import { CreateCommentRequest, CommentDto } from "../dtos/TaskDtos";
import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";

interface CommentInput {
  taskId: string;
  workspaceId: string;
}

interface CreateCommentInput extends CommentInput {
  data: CreateCommentRequest;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export class AddCommentUseCase
  implements UseCase<CreateCommentInput, Result<CommentDto>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute(input: CreateCommentInput): Promise<Result<CommentDto>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<CommentDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<CommentDto>("Task not found");
    }

    const comment = Comment.create({
      taskId: input.taskId,
      userId: input.userId,
      userName: input.userName,
      userAvatar: input.userAvatar,
      content: input.data.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    const response: CommentDto = {
      id: savedComment.id,
      userId: savedComment.userId,
      userName: savedComment.userName,
      userAvatar: savedComment.userAvatar,
      content: savedComment.content,
      createdAt: savedComment.createdAt.toISOString(),
      updatedAt: savedComment.updatedAt.toISOString(),
    };

    return Result.ok<CommentDto>(response);
  }
}

export class GetCommentsUseCase
  implements UseCase<CommentInput, Result<CommentDto[]>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute(input: CommentInput): Promise<Result<CommentDto[]>> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<CommentDto[]>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<CommentDto[]>("Task not found");
    }

    const comments = await this.commentRepository.findByTaskId(input.taskId);

    const response: CommentDto[] = comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    }));

    return Result.ok<CommentDto[]>(response);
  }
}
