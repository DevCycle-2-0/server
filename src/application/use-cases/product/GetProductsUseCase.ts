import { IProductRepository } from '@domain/repositories/IProductRepository';
import { getPaginationParams } from '@shared/utils/pagination';

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(workspaceId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    return this.productRepository.findByWorkspaceId(workspaceId, p, l);
  }
}
