import { Release, ReleaseStatus } from "../entities/Release";

export interface ReleaseFilters {
  status?: string;
  productId?: string;
  platform?: string;
  workspaceId: string;
}

export interface ReleaseSortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IReleaseRepository {
  findById(id: string): Promise<Release | null>;
  findAll(
    filters: ReleaseFilters,
    sortOptions: ReleaseSortOptions,
    page: number,
    limit: number
  ): Promise<{ releases: Release[]; total: number }>;
  save(release: Release): Promise<Release>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
