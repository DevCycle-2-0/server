import { IFeatureRepository } from '@core/domain/repositories/IFeatureRepository';
import { NotFoundError } from '@core/shared/errors/DomainError';

interface VoteFeatureInput {
  featureId: string;
  userId: string;
}

export class VoteFeature {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: VoteFeatureInput): Promise<void> {
    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature) {
      throw new NotFoundError('Feature');
    }

    feature.vote();
    await this.featureRepository.update(feature);
  }
}
