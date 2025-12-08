import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { CreateProductDto } from '@application/dtos/product/CreateProductDto';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(dto: CreateProductDto, workspaceId: string, userId: string) {
    const productId = uuidv4();
    const product = Product.create(
      productId,
      workspaceId,
      dto.name,
      userId,
      dto.description
    );

    if (dto.color) product.color = dto.color;
    if (dto.settings) product.settings = dto.settings;

    return this.productRepository.create(product);
  }
}
