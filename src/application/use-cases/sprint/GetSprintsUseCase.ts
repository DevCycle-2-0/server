import { ISprintRepository } from "@domain/repositories/ISprintRepository";
import { getPaginationParams } from "@shared/utils/pagination";

export class GetSprintsUseCase {
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(
    workspaceId: string,
    filters: any = {},
    page?: number,
    limit?: number
  ) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.sprintRepository.findByWorkspaceId(workspaceId, filters, p, l);
  }
}
