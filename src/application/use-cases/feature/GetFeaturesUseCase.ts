import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { getPaginationParams } from '@shared/utils/pagination';

export class GetFeaturesUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(
    workspaceId: string,
    filters: any = {},
    page?: number,
    limit?: number
  ) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.featureRepository.findByWorkspaceId(workspaceId, filters, p, l);
  }
}
