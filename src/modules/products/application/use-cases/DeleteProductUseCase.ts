import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";

interface DeleteProductInput {
  productId: string;
  workspaceId: string;
}

export class DeleteProductUseCase
  implements UseCase<DeleteProductInput, Result<void>>
{
  constructor(private productRepository: IProductRepository) {}

  async execute(input: DeleteProductInput): Promise<Result<void>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return Result.fail<void>("Product not found");
    }

    // Validate workspace
    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<void>("Product not found");
    }

    // Soft delete by archiving
    product.archive();
    await this.productRepository.save(product);

    return Result.ok<void>();
  }
}
