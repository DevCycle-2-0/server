import { Comment } from "../entities/Comment";

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<boolean>;
}
