import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { getPaginationParams } from "@shared/utils/pagination";

export class GetTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(
    workspaceId: string,
    filters: any = {},
    page?: number,
    limit?: number
  ) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.taskRepository.findByWorkspaceId(workspaceId, filters, p, l);
  }
}
