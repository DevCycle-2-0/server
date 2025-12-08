import { IProductRepository } from "@domain/repositories/IProductRepository";
import { Product } from "@domain/entities/Product.entity";
import { Platform } from "@shared/types/common.types";

export interface CreateProductDTO {
  name: string;
  description?: string;
  platforms: Platform[];
  workspaceId: string;
  ownerId: string;
}

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    return await this.productRepository.create(data);
  }
}
