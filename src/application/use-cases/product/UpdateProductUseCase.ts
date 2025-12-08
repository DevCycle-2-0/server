import { IProductRepository } from '@domain/repositories/IProductRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { UpdateProductDto } from '@application/dtos/product/UpdateProductDto';

export class UpdateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.update(dto);
    return this.productRepository.update(productId, product);
  }
}
