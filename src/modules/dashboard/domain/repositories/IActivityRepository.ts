import { Activity } from "../entities/Activity";
import { PaginationParams } from "@shared/application/PaginationParams";

export interface ActivityFilters {
  workspaceId: string;
  entityType?: string;
  userId?: string;
}

export interface IActivityRepository {
  save(activity: Activity): Promise<Activity>;
  findAll(
    filters: ActivityFilters,
    pagination: PaginationParams
  ): Promise<{ activities: Activity[]; total: number }>;
  findRecent(workspaceId: string, limit: number): Promise<Activity[]>;
  deleteOldActivities(workspaceId: string, daysToKeep: number): Promise<number>;
}
