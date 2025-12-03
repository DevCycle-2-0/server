import { IFeatureRepository } from '@core/domain/repositories/IFeatureRepository';
import { Feature } from '@core/domain/entities/Feature';

interface CreateFeatureInput {
  workspaceId: string;
  productId: string;
  title: string;
  description?: string;
}

interface CreateFeatureOutput {
  featureId: string;
  title: string;
  status: string;
}

export class CreateFeature {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: CreateFeatureInput): Promise<CreateFeatureOutput> {
    const feature = Feature.create(
      input.workspaceId,
      input.productId,
      input.title,
      input.description
    );

    await this.featureRepository.save(feature);

    return {
      featureId: feature.id,
      title: feature.title,
      status: feature.status,
    };
  }
}
