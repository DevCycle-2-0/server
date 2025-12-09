import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { ProductDto } from "../dtos/ProductDtos";

export class GetProductByIdUseCase
  implements UseCase<string, Result<ProductDto>>
{
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string): Promise<Result<ProductDto>> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      return Result.fail<ProductDto>("Product not found");
    }

    const response: ProductDto = {
      id: product.id,
      name: product.name,
      description: product.description,
      platforms: product.platforms,
      ownerId: product.ownerId,
      ownerName: product.ownerName,
      status: product.status,
      featuresCount: product.featuresCount,
      bugsCount: product.bugsCount,
      teamMembersCount: product.teamMembersCount,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return Result.ok<ProductDto>(response);
  }
}
