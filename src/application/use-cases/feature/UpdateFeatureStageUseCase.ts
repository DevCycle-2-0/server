import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { FeatureStage } from '@shared/types';

export class UpdateFeatureStageUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(featureId: string, newStage: FeatureStage) {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundError('Feature not found');
    }

    feature.changeStage(newStage);
    return this.featureRepository.update(featureId, feature);
  }
}
