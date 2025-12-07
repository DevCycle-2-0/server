import { Product } from "../entities/Product";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number
  ): Promise<{ products: Product[]; total: number }>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
