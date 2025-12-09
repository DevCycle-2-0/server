import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { GetProductsQuery, ProductDto } from "../dtos/ProductDtos";

interface GetProductsInput {
  query: GetProductsQuery;
  workspaceId: string;
}

interface GetProductsResult {
  products: ProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetProductsUseCase
  implements UseCase<GetProductsInput, Result<GetProductsResult>>
{
  constructor(private productRepository: IProductRepository) {}

  async execute(input: GetProductsInput): Promise<Result<GetProductsResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { products, total } = await this.productRepository.findAll(
      {
        status: input.query.status,
        platform: input.query.platform,
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

    const response: GetProductsResult = {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        platforms: p.platforms,
        ownerId: p.ownerId,
        ownerName: p.ownerName,
        status: p.status,
        featuresCount: p.featuresCount,
        bugsCount: p.bugsCount,
        teamMembersCount: p.teamMembersCount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
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

    return Result.ok<GetProductsResult>(response);
  }
}
