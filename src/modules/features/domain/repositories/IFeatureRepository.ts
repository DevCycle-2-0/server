import { Feature, FeatureStatus, Priority } from "../entities/Feature";

export interface FeatureFilters {
  status?: string; // comma-separated
  priority?: string; // comma-separated
  productId?: string;
  platform?: string;
  assigneeId?: string;
  sprintId?: string;
  search?: string;
  workspaceId: string;
}

export interface FeatureSortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IFeatureRepository {
  findById(id: string): Promise<Feature | null>;
  findAll(
    filters: FeatureFilters,
    sortOptions: FeatureSortOptions,
    page: number,
    limit: number
  ): Promise<{ features: Feature[]; total: number }>;
  save(feature: Feature): Promise<Feature>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
