import { Release } from "../entities/Release";

export interface IReleaseRepository {
  create(release: Release): Promise<Release>;
  findById(id: string): Promise<Release | null>;
  findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ releases: Release[]; total: number }>;
  update(id: string, data: Partial<Release>): Promise<Release>;
  delete(id: string): Promise<void>;
}
