import { IFeatureRepository } from '@core/domain/repositories/IFeatureRepository';
import { NotFoundError } from '@core/shared/errors/DomainError';

interface ApproveFeatureInput {
  featureId: string;
}

export class ApproveFeature {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: ApproveFeatureInput): Promise<void> {
    const feature = await this.featureRepository.findById(input.featureId);
    if (!feature) {
      throw new NotFoundError('Feature');
    }

    feature.approve();
    await this.featureRepository.update(feature);
  }
}
