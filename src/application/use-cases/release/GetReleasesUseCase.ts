import { IReleaseRepository } from "@domain/repositories/IReleaseRepository";
import { getPaginationParams } from "@shared/utils/pagination";

export class GetReleasesUseCase {
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(
    workspaceId: string,
    filters: any = {},
    page?: number,
    limit?: number
  ) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.releaseRepository.findByWorkspaceId(workspaceId, filters, p, l);
  }
}
