import { Workspace } from '../entities/Workspace';

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  save(workspace: Workspace): Promise<void>;
  update(workspace: Workspace): Promise<void>;
  delete(id: string): Promise<void>;
}
