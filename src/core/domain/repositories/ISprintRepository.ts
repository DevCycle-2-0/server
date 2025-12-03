import { Sprint } from '../entities/Sprint';

export interface ISprintRepository {
  findById(id: string): Promise<Sprint | null>;
  findByProduct(productId: string): Promise<Sprint[]>;
  findActive(workspaceId: string): Promise<Sprint[]>;
  save(sprint: Sprint): Promise<void>;
  update(sprint: Sprint): Promise<void>;
  delete(id: string): Promise<void>;
}
