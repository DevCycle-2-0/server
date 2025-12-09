import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { UpdateProductRequest, ProductDto } from "../dtos/ProductDtos";

interface UpdateProductInput {
  productId: string;
  data: UpdateProductRequest;
  workspaceId: string;
}

export class UpdateProductUseCase
  implements UseCase<UpdateProductInput, Result<ProductDto>>
{
  constructor(private productRepository: IProductRepository) {}

  async execute(input: UpdateProductInput): Promise<Result<ProductDto>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return Result.fail<ProductDto>("Product not found");
    }

    // Validate workspace
    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<ProductDto>("Product not found");
    }

    // Check name uniqueness if name is being updated
    if (input.data.name && input.data.name !== product.name) {
      const nameExists = await this.productRepository.existsByName(
        input.data.name,
        input.workspaceId,
        input.productId
      );

      if (nameExists) {
        return Result.fail<ProductDto>("Product with this name already exists");
      }
    }

    product.update(
      input.data.name,
      input.data.description,
      input.data.platforms
    );

    const updatedProduct = await this.productRepository.save(product);

    const response: ProductDto = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      platforms: updatedProduct.platforms,
      ownerId: updatedProduct.ownerId,
      ownerName: updatedProduct.ownerName,
      status: updatedProduct.status,
      featuresCount: updatedProduct.featuresCount,
      bugsCount: updatedProduct.bugsCount,
      teamMembersCount: updatedProduct.teamMembersCount,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    };

    return Result.ok<ProductDto>(response);
  }
}
