import { IProductRepository } from '@core/domain/repositories/IProductRepository';

interface ListProductsInput {
  workspaceId: string;
}

interface ProductDTO {
  id: string;
  name: string;
  description?: string;
  platform: string;
  version?: string;
  status: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ListProductsOutput {
  products: ProductDTO[];
  total: number;
}

export class ListProducts {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: ListProductsInput): Promise<ListProductsOutput> {
    const products = await this.productRepository.findByWorkspace(input.workspaceId);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        platform: p.platform,
        version: p.version,
        status: p.status,
        icon: p.icon,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total: products.length,
    };
  }
}
