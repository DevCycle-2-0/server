import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateFeatureDto } from '@application/dtos/feature/UpdateFeatureDto';

export class UpdateFeatureUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(featureId: string, dto: UpdateFeatureDto) {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundError('Feature not found');
    }

    feature.update(dto);
    return this.featureRepository.update(featureId, feature);
  }
}
