import { Product } from "../entities/Product";

export interface ProductFilters {
  status?: "active" | "archived";
  platform?: string;
  search?: string;
  workspaceId: string;
}

export interface ProductSortOptions {
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(
    filters: ProductFilters,
    sortOptions: ProductSortOptions,
    page: number,
    limit: number
  ): Promise<{ products: Product[]; total: number }>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  existsByName(
    name: string,
    workspaceId: string,
    excludeId?: string
  ): Promise<boolean>;
}
