import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { NotFoundError } from '@shared/errors/AppError';

export class VoteFeatureUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(featureId: string, userId: string, remove: boolean = false) {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundError('Feature not found');
    }

    if (remove) {
      feature.removeVote();
    } else {
      feature.addVote();
    }

    return this.featureRepository.update(featureId, feature);
  }
}
