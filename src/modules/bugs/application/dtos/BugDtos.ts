// src/modules/bugs/application/dtos/BugDtos.ts
import {
  BugStatus,
  BugSeverity,
  BugRetestResult,
} from "@modules/bugs/domain/entities/Bug";
import { Priority } from "@modules/features/domain/entities/Feature";
import { Platform } from "@modules/products/domain/entities/Product";

export interface BugRetestResultDto {
  id: string;
  status: "passed" | "failed";
  testedBy: string;
  testedByName: string;
  notes?: string;
  environment: string;
  testedAt: string;
}

export interface BugDto {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  environment: string;
  version?: string;
  browserInfo?: string;
  retestResults: BugRetestResultDto[];
  duplicateOf?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateBugRequest {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: BugSeverity;
  priority: Priority;
  productId: string;
  platform: Platform;
  environment: string;
  version?: string;
  browserInfo?: string;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  severity?: BugSeverity;
  priority?: Priority;
}

export interface UpdateBugStatusRequest {
  status: BugStatus;
}

export interface AssignBugRequest {
  assigneeId: string;
}

export interface LinkFeatureRequest {
  featureId: string;
}

export interface AddToSprintRequest {
  sprintId: string;
}

export interface AddRetestResultRequest {
  status: "passed" | "failed";
  notes?: string;
  environment: string;
}

export interface BugStatisticsDto {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openBugs: number;
  closedBugs: number;
  averageResolutionTime: number;
  criticalOpen: number;
  resolutionRate: number;
}

export interface GetBugsQuery {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  priority?: string;
  productId?: string;
  platform?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  search?: string;
}
