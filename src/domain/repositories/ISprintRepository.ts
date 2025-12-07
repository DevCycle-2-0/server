import { Sprint } from "../entities/Sprint";

export interface ISprintRepository {
  create(sprint: Sprint): Promise<Sprint>;
  findById(id: string): Promise<Sprint | null>;
  findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ sprints: Sprint[]; total: number }>;
  update(id: string, data: Partial<Sprint>): Promise<Sprint>;
  delete(id: string): Promise<void>;
}
