import { IBugRepository } from "@domain/repositories/IBugRepository";
import { getPaginationParams } from "@shared/utils/pagination";

export class GetBugsUseCase {
  constructor(private bugRepository: IBugRepository) {}

  async execute(
    workspaceId: string,
    filters: any = {},
    page?: number,
    limit?: number
  ) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.bugRepository.findByWorkspaceId(workspaceId, filters, p, l);
  }
}
