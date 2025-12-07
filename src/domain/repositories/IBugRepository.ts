import { Bug } from "../entities/Bug";

export interface IBugRepository {
  create(bug: Bug): Promise<Bug>;
  findById(id: string): Promise<Bug | null>;
  findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ bugs: Bug[]; total: number }>;
  update(id: string, data: Partial<Bug>): Promise<Bug>;
  delete(id: string): Promise<void>;
}
