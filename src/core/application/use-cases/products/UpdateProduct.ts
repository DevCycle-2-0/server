import { IProductRepository } from '@core/domain/repositories/IProductRepository';
import { NotFoundError } from '@core/shared/errors/DomainError';

interface UpdateProductInput {
  productId: string;
  name?: string;
  description?: string;
  version?: string;
  icon?: string;
}

export class UpdateProduct {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: UpdateProductInput): Promise<void> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    product.update({
      name: input.name,
      description: input.description,
      version: input.version,
      icon: input.icon,
    });

    await this.productRepository.update(product);
  }
}
