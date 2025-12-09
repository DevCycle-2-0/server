import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { Product } from "@modules/products/domain/entities/Product";
import { CreateProductRequest, ProductDto } from "../dtos/ProductDtos";

interface CreateProductInput {
  data: CreateProductRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class CreateProductUseCase
  implements UseCase<CreateProductInput, Result<ProductDto>>
{
  constructor(private productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Result<ProductDto>> {
    // Validate name uniqueness
    const nameExists = await this.productRepository.existsByName(
      input.data.name,
      input.workspaceId
    );

    if (nameExists) {
      return Result.fail<ProductDto>("Product with this name already exists");
    }

    // Create product
    const product = Product.create({
      name: input.data.name,
      description: input.data.description,
      platforms: input.data.platforms,
      ownerId: input.userId,
      ownerName: input.userName,
      workspaceId: input.workspaceId,
    });

    const savedProduct = await this.productRepository.save(product);

    const response: ProductDto = {
      id: savedProduct.id,
      name: savedProduct.name,
      description: savedProduct.description,
      platforms: savedProduct.platforms,
      ownerId: savedProduct.ownerId,
      ownerName: savedProduct.ownerName,
      status: savedProduct.status,
      featuresCount: savedProduct.featuresCount,
      bugsCount: savedProduct.bugsCount,
      teamMembersCount: savedProduct.teamMembersCount,
      createdAt: savedProduct.createdAt.toISOString(),
      updatedAt: savedProduct.updatedAt.toISOString(),
    };

    return Result.ok<ProductDto>(response);
  }
}
