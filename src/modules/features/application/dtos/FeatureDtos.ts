import {
  FeatureStatus,
  Priority,
} from "@modules/features/domain/entities/Feature";
import { Platform } from "@modules/products/domain/entities/Product";

export interface FeatureDto {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  requestedBy: string;
  requestedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  votes: number;
  votedBy: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string; // ISO 8601 string
  completedAt?: string; // ISO 8601 string
  tags: string[];
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface CreateFeatureRequest {
  title: string;
  description: string;
  priority: Priority;
  productId: string;
  platform: Platform;
  tags?: string[];
  dueDate?: string; // ISO 8601 string
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateFeatureStatusRequest {
  status: FeatureStatus;
}

export interface GetFeaturesQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  productId?: string;
  platform?: string;
  assigneeId?: string;
  sprintId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface VoteResponse {
  votes: number;
  votedBy: string[];
}

export interface AssignSprintRequest {
  sprintId: string;
}

export interface ApproveFeatureRequest {
  comment?: string;
}

export interface RejectFeatureRequest {
  reason: string;
}
