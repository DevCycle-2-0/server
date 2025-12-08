import { v4 as uuidv4 } from 'uuid';
import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { Feature } from '@domain/entities/Feature';
import { CreateFeatureDto } from '@application/dtos/feature/CreateFeatureDto';

export class CreateFeatureUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(dto: CreateFeatureDto, workspaceId: string, userId: string) {
    const featureId = uuidv4();
    const feature = Feature.create(
      featureId,
      workspaceId,
      dto.title,
      userId,
      dto.description
    );

    if (dto.productId) feature.productId = dto.productId;
    if (dto.priority) feature.priority = dto.priority;
    if (dto.storyPoints) feature.storyPoints = dto.storyPoints;
    if (dto.assigneeId) feature.assigneeId = dto.assigneeId;
    if (dto.tags) feature.tags = dto.tags;
    if (dto.dueDate) feature.dueDate = dto.dueDate;

    return this.featureRepository.create(feature);
  }
}
