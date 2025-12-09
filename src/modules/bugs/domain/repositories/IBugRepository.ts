import { Bug, BugStatus, BugSeverity } from "../entities/Bug";

export interface BugFilters {
  status?: string; // comma-separated
  severity?: string; // comma-separated
  priority?: string; // comma-separated
  productId?: string;
  platform?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  search?: string;
  workspaceId: string;
}

export interface BugSortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BugStatistics {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openBugs: number;
  closedBugs: number;
  averageResolutionTime: number;
  criticalOpen: number;
  resolutionRate: number;
}

export interface IBugRepository {
  findById(id: string): Promise<Bug | null>;
  findAll(
    filters: BugFilters,
    sortOptions: BugSortOptions,
    page: number,
    limit: number
  ): Promise<{ bugs: Bug[]; total: number }>;
  save(bug: Bug): Promise<Bug>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  getStatistics(
    productId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<BugStatistics>;
}
