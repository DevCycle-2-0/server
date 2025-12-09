import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { Feature } from "@modules/features/domain/entities/Feature";
import { CreateFeatureRequest, FeatureDto } from "../dtos/FeatureDtos";

interface CreateFeatureInput {
  data: CreateFeatureRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class CreateFeatureUseCase
  implements UseCase<CreateFeatureInput, Result<FeatureDto>>
{
  constructor(
    private featureRepository: IFeatureRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(input: CreateFeatureInput): Promise<Result<FeatureDto>> {
    // Validate product exists
    const product = await this.productRepository.findById(input.data.productId);
    if (!product) {
      return Result.fail<FeatureDto>("Product not found");
    }

    // Validate workspace access
    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<FeatureDto>("Product not found");
    }

    // Create feature
    const feature = Feature.create({
      title: input.data.title,
      description: input.data.description,
      priority: input.data.priority,
      productId: input.data.productId,
      productName: product.name,
      platform: input.data.platform,
      requestedBy: input.userId,
      requestedByName: input.userName,
      workspaceId: input.workspaceId,
      tags: input.data.tags || [],
      dueDate: input.data.dueDate ? new Date(input.data.dueDate) : undefined,
    });

    const savedFeature = await this.featureRepository.save(feature);

    const response: FeatureDto = {
      id: savedFeature.id,
      title: savedFeature.title,
      description: savedFeature.description,
      status: savedFeature.status,
      priority: savedFeature.priority,
      productId: savedFeature.productId,
      productName: savedFeature.productName,
      platform: savedFeature.platform,
      requestedBy: savedFeature.requestedBy,
      requestedByName: savedFeature.requestedByName,
      assigneeId: savedFeature.assigneeId,
      assigneeName: savedFeature.assigneeName,
      sprintId: savedFeature.sprintId,
      sprintName: savedFeature.sprintName,
      votes: savedFeature.votes,
      votedBy: savedFeature.votedBy,
      estimatedHours: savedFeature.estimatedHours,
      actualHours: savedFeature.actualHours,
      dueDate: savedFeature.dueDate?.toISOString(),
      completedAt: savedFeature.completedAt?.toISOString(),
      tags: savedFeature.tags,
      createdAt: savedFeature.createdAt.toISOString(),
      updatedAt: savedFeature.updatedAt.toISOString(),
    };

    return Result.ok<FeatureDto>(response);
  }
}
