import { Task, TaskStatus, TaskType } from "../entities/Task";

export interface TaskFilters {
  status?: string; // comma-separated
  type?: string; // comma-separated
  priority?: string;
  featureId?: string;
  sprintId?: string;
  assigneeId?: string;
  search?: string;
  workspaceId: string;
}

export interface TaskSortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(
    filters: TaskFilters,
    sortOptions: TaskSortOptions,
    page: number,
    limit: number
  ): Promise<{ tasks: Task[]; total: number }>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
