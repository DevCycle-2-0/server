import { Feature } from "../entities/Feature";

export interface IFeatureRepository {
  create(feature: Feature): Promise<Feature>;
  findById(id: string): Promise<Feature | null>;
  findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ features: Feature[]; total: number }>;
  update(id: string, data: Partial<Feature>): Promise<Feature>;
  delete(id: string): Promise<void>;
}
