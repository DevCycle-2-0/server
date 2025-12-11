// src/modules/sprints/application/dtos/SprintDtos.ts
import {
  SprintStatus,
  SprintRetrospective,
} from "@modules/sprints/domain/entities/Sprint";
import {
  BurndownPoint,
  SprintMetrics,
} from "@modules/sprints/domain/repositories/ISprintRepository";

export interface SprintRetrospectiveDto {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  savedAt?: string;
  savedBy?: string;
  savedByName?: string;
}

export interface SprintDto {
  id: string;
  name: string;
  goal: string;
  productId: string;
  productName: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  taskIds: string[];
  bugIds: string[];
  capacity: number;
  velocity?: number;
  retrospective?: SprintRetrospectiveDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  name: string;
  goal: string;
  productId: string;
  startDate: string;
  endDate: string;
  capacity?: number; // Make optional with default 0
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface AddTaskToSprintRequest {
  taskId: string;
}

export interface AddBugToSprintRequest {
  bugId: string;
}

export interface SaveRetrospectiveRequest {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
}

export interface SprintMetricsDto {
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

export interface GetSprintsQuery {
  page?: number;
  limit?: number;
  status?: string;
  productId?: string;
}
