import { Release } from '../entities/Release';

export interface IReleaseRepository {
  findById(id: string): Promise<Release | null>;
  findByProduct(productId: string): Promise<Release[]>;
  findByWorkspace(workspaceId: string): Promise<Release[]>;
  save(release: Release): Promise<void>;
  update(release: Release): Promise<void>;
  delete(id: string): Promise<void>;
}
