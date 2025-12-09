import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { FeatureDto } from "../dtos/FeatureDtos";

export class GetFeatureByIdUseCase
  implements UseCase<string, Result<FeatureDto>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(featureId: string): Promise<Result<FeatureDto>> {
    const feature = await this.featureRepository.findById(featureId);

    if (!feature) {
      return Result.fail<FeatureDto>("Feature not found");
    }

    const response: FeatureDto = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      status: feature.status,
      priority: feature.priority,
      productId: feature.productId,
      productName: feature.productName,
      platform: feature.platform,
      requestedBy: feature.requestedBy,
      requestedByName: feature.requestedByName,
      assigneeId: feature.assigneeId,
      assigneeName: feature.assigneeName,
      sprintId: feature.sprintId,
      sprintName: feature.sprintName,
      votes: feature.votes,
      votedBy: feature.votedBy,
      estimatedHours: feature.estimatedHours,
      actualHours: feature.actualHours,
      dueDate: feature.dueDate?.toISOString(),
      completedAt: feature.completedAt?.toISOString(),
      tags: feature.tags,
      createdAt: feature.createdAt.toISOString(),
      updatedAt: feature.updatedAt.toISOString(),
    };

    return Result.ok<FeatureDto>(response);
  }
}

// src/modules/features/application/use-cases/UpdateFeatureUseCase.ts
import { UpdateFeatureRequest } from "../dtos/FeatureDtos";

interface UpdateFeatureInput {
  featureId: string;
  data: UpdateFeatureRequest;
  workspaceId: string;
}

export class UpdateFeatureUseCase
  implements UseCase<UpdateFeatureInput, Result<FeatureDto>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: UpdateFeatureInput): Promise<Result<FeatureDto>> {
    const feature = await this.featureRepository.findById(input.featureId);

    if (!feature) {
      return Result.fail<FeatureDto>("Feature not found");
    }

    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<FeatureDto>("Feature not found");
    }

    feature.update(
      input.data.title,
      input.data.description,
      input.data.priority,
      input.data.estimatedHours,
      input.data.tags
    );

    const updatedFeature = await this.featureRepository.save(feature);

    const response: FeatureDto = {
      id: updatedFeature.id,
      title: updatedFeature.title,
      description: updatedFeature.description,
      status: updatedFeature.status,
      priority: updatedFeature.priority,
      productId: updatedFeature.productId,
      productName: updatedFeature.productName,
      platform: updatedFeature.platform,
      requestedBy: updatedFeature.requestedBy,
      requestedByName: updatedFeature.requestedByName,
      assigneeId: updatedFeature.assigneeId,
      assigneeName: updatedFeature.assigneeName,
      sprintId: updatedFeature.sprintId,
      sprintName: updatedFeature.sprintName,
      votes: updatedFeature.votes,
      votedBy: updatedFeature.votedBy,
      estimatedHours: updatedFeature.estimatedHours,
      actualHours: updatedFeature.actualHours,
      dueDate: updatedFeature.dueDate?.toISOString(),
      completedAt: updatedFeature.completedAt?.toISOString(),
      tags: updatedFeature.tags,
      createdAt: updatedFeature.createdAt.toISOString(),
      updatedAt: updatedFeature.updatedAt.toISOString(),
    };

    return Result.ok<FeatureDto>(response);
  }
}

// src/modules/features/application/use-cases/UpdateFeatureStatusUseCase.ts
import { UpdateFeatureStatusRequest } from "../dtos/FeatureDtos";

interface UpdateFeatureStatusInput {
  featureId: string;
  data: UpdateFeatureStatusRequest;
  workspaceId: string;
}

export class UpdateFeatureStatusUseCase
  implements UseCase<UpdateFeatureStatusInput, Result<FeatureDto>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: UpdateFeatureStatusInput): Promise<Result<FeatureDto>> {
    const feature = await this.featureRepository.findById(input.featureId);

    if (!feature) {
      return Result.fail<FeatureDto>("Feature not found");
    }

    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<FeatureDto>("Feature not found");
    }

    const updated = feature.updateStatus(input.data.status);
    if (!updated) {
      return Result.fail<FeatureDto>(
        `Invalid status transition from ${feature.status} to ${input.data.status}`
      );
    }

    const updatedFeature = await this.featureRepository.save(feature);

    const response: FeatureDto = {
      id: updatedFeature.id,
      title: updatedFeature.title,
      description: updatedFeature.description,
      status: updatedFeature.status,
      priority: updatedFeature.priority,
      productId: updatedFeature.productId,
      productName: updatedFeature.productName,
      platform: updatedFeature.platform,
      requestedBy: updatedFeature.requestedBy,
      requestedByName: updatedFeature.requestedByName,
      assigneeId: updatedFeature.assigneeId,
      assigneeName: updatedFeature.assigneeName,
      sprintId: updatedFeature.sprintId,
      sprintName: updatedFeature.sprintName,
      votes: updatedFeature.votes,
      votedBy: updatedFeature.votedBy,
      estimatedHours: updatedFeature.estimatedHours,
      actualHours: updatedFeature.actualHours,
      dueDate: updatedFeature.dueDate?.toISOString(),
      completedAt: updatedFeature.completedAt?.toISOString(),
      tags: updatedFeature.tags,
      createdAt: updatedFeature.createdAt.toISOString(),
      updatedAt: updatedFeature.updatedAt.toISOString(),
    };

    return Result.ok<FeatureDto>(response);
  }
}

// src/modules/features/application/use-cases/VoteFeatureUseCase.ts
import { VoteResponse } from "../dtos/FeatureDtos";

interface VoteFeatureInput {
  featureId: string;
  userId: string;
  workspaceId: string;
}

export class VoteFeatureUseCase
  implements UseCase<VoteFeatureInput, Result<VoteResponse>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: VoteFeatureInput): Promise<Result<VoteResponse>> {
    const feature = await this.featureRepository.findById(input.featureId);

    if (!feature) {
      return Result.fail<VoteResponse>("Feature not found");
    }

    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<VoteResponse>("Feature not found");
    }

    feature.vote(input.userId);
    const updatedFeature = await this.featureRepository.save(feature);

    const response: VoteResponse = {
      votes: updatedFeature.votes,
      votedBy: updatedFeature.votedBy,
    };

    return Result.ok<VoteResponse>(response);
  }
}

// src/modules/features/application/use-cases/UnvoteFeatureUseCase.ts
export class UnvoteFeatureUseCase
  implements UseCase<VoteFeatureInput, Result<VoteResponse>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: VoteFeatureInput): Promise<Result<VoteResponse>> {
    const feature = await this.featureRepository.findById(input.featureId);

    if (!feature) {
      return Result.fail<VoteResponse>("Feature not found");
    }

    if (feature.workspaceId !== input.workspaceId) {
      return Result.fail<VoteResponse>("Feature not found");
    }

    feature.unvote(input.userId);
    const updatedFeature = await this.featureRepository.save(feature);

    const response: VoteResponse = {
      votes: updatedFeature.votes,
      votedBy: updatedFeature.votedBy,
    };

    return Result.ok<VoteResponse>(response);
  }
}
