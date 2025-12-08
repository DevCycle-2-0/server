import { IProductRepository } from "@domain/repositories/IProductRepository";
import { PaginatedResponse } from "@shared/types/common.types";
import { Product } from "@domain/entities/Product.entity";

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(filters: any): Promise<PaginatedResponse<Product>> {
    const result = await this.productRepository.findAll(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
        hasNext: page * limit < result.count,
        hasPrev: page > 1,
      },
    };
  }
}
