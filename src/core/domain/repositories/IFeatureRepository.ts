import { Feature } from '../entities/Feature';

export interface IFeatureRepository {
  findById(id: string): Promise<Feature | null>;
  findByProduct(productId: string): Promise<Feature[]>;
  findByWorkspace(workspaceId: string, filters?: any): Promise<Feature[]>;
  save(feature: Feature): Promise<void>;
  update(feature: Feature): Promise<void>;
  delete(id: string): Promise<void>;
}
