import { IFeatureRepository } from "@domain/repositories/IFeatureRepository";
import { Feature } from "@domain/entities/Feature.entity";

export class VoteFeatureUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(featureId: string, userId: string): Promise<Feature> {
    return await this.featureRepository.vote(featureId, userId);
  }
}
