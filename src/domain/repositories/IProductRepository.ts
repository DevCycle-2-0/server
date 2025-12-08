import { Product } from "../entities/Product.entity";

export interface IProductRepository {
  create(data: Partial<Product>): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(filters: any): Promise<{ rows: Product[]; count: number }>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
