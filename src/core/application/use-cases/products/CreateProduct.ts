import { IProductRepository } from '@core/domain/repositories/IProductRepository';
import { Product, PlatformType } from '@core/domain/entities/Product';

interface CreateProductInput {
  workspaceId: string;
  name: string;
  platform: PlatformType;
  description?: string;
}

interface CreateProductOutput {
  productId: string;
  name: string;
  platform: PlatformType;
  status: string;
}

export class CreateProduct {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const product = Product.create(
      input.workspaceId,
      input.name,
      input.platform,
      input.description
    );

    await this.productRepository.save(product);

    return {
      productId: product.id,
      name: product.name,
      platform: product.platform,
      status: product.status,
    };
  }
}
