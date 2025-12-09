import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { GetFeaturesQuery, FeatureDto } from "../dtos/FeatureDtos";

interface GetFeaturesInput {
  query: GetFeaturesQuery;
  workspaceId: string;
}

interface GetFeaturesResult {
  features: FeatureDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetFeaturesUseCase
  implements UseCase<GetFeaturesInput, Result<GetFeaturesResult>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(input: GetFeaturesInput): Promise<Result<GetFeaturesResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { features, total } = await this.featureRepository.findAll(
      {
        status: input.query.status,
        priority: input.query.priority,
        productId: input.query.productId,
        platform: input.query.platform,
        assigneeId: input.query.assigneeId,
        sprintId: input.query.sprintId,
        search: input.query.search,
        workspaceId: input.workspaceId,
      },
      {
        sortBy: input.query.sortBy,
        sortOrder: input.query.sortOrder,
      },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    const response: GetFeaturesResult = {
      features: features.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        priority: f.priority,
        productId: f.productId,
        productName: f.productName,
        platform: f.platform,
        requestedBy: f.requestedBy,
        requestedByName: f.requestedByName,
        assigneeId: f.assigneeId,
        assigneeName: f.assigneeName,
        sprintId: f.sprintId,
        sprintName: f.sprintName,
        votes: f.votes,
        votedBy: f.votedBy,
        estimatedHours: f.estimatedHours,
        actualHours: f.actualHours,
        dueDate: f.dueDate?.toISOString(),
        completedAt: f.completedAt?.toISOString(),
        tags: f.tags,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return Result.ok<GetFeaturesResult>(response);
  }
}
