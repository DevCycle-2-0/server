import { Sprint, SprintStatus } from "../entities/Sprint";

export interface SprintFilters {
  status?: string; // comma-separated
  productId?: string;
  workspaceId: string;
}

export interface SprintSortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  totalBugs: number;
  fixedBugs: number;
  totalPoints: number;
  completedPoints: number;
  burndownData: BurndownPoint[];
  velocityTrend: number[];
  blockedItems: number;
}

export interface ISprintRepository {
  findById(id: string): Promise<Sprint | null>;
  findAll(
    filters: SprintFilters,
    sortOptions: SprintSortOptions,
    page: number,
    limit: number
  ): Promise<{ sprints: Sprint[]; total: number }>;
  save(sprint: Sprint): Promise<Sprint>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  getMetrics(sprintId: string): Promise<SprintMetrics>;
}
