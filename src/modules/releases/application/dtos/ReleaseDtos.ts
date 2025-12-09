import {
  ReleaseStatus,
  PipelineStage,
  PipelineStatus,
  ApprovalStatus,
} from "@modules/releases/domain/entities/Release";
import { Platform } from "@modules/products/domain/entities/Product";

export interface PipelineStepDto {
  stage: PipelineStage;
  status: PipelineStatus;
  startedAt?: string;
  completedAt?: string;
  logs?: string;
}

export interface RollbackLogDto {
  id: string;
  version: string;
  reason: string;
  rolledBackAt: string;
  rolledBackBy: string;
  notes?: string;
}

export interface LinkedFeatureDto {
  featureId: string;
  featureTitle: string;
}

export interface LinkedBugFixDto {
  bugId: string;
  bugTitle: string;
}

export interface ApproverDto {
  userId: string;
  userName: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  approvedAt?: string;
}

export interface ReleaseDto {
  id: string;
  version: string;
  buildId: string;
  productId: string;
  productName: string;
  platform: Platform;
  status: ReleaseStatus;
  releaseDate?: string;
  plannedDate?: string;
  features: LinkedFeatureDto[];
  bugFixes: LinkedBugFixDto[];
  testCoverage: number;
  pipeline: PipelineStepDto[];
  rollbackLogs: RollbackLogDto[];
  releaseNotes: string;
  approvalStatus?: ApprovalStatus;
  approvers: ApproverDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseRequest {
  version: string;
  buildId: string;
  productId: string;
  platform: Platform;
  plannedDate?: string;
  releaseNotes?: string;
}

export interface UpdateReleaseRequest {
  version?: string;
  buildId?: string;
  plannedDate?: string;
  releaseNotes?: string;
}

export interface UpdateReleaseStatusRequest {
  status: ReleaseStatus;
}

export interface CompletePipelineStageRequest {
  success: boolean;
  notes?: string;
}

export interface DeployReleaseRequest {
  environment: "staging" | "production";
}

export interface RollbackReleaseRequest {
  reason: string;
  targetVersion: string;
}

export interface UpdateReleaseNotesRequest {
  notes: string;
}

export interface LinkFeatureRequest {
  featureId: string;
}

export interface LinkBugRequest {
  bugId: string;
}

export interface RequestApprovalRequest {
  approvers: string[];
}

export interface ApproveReleaseRequest {
  comment?: string;
}

export interface RejectReleaseRequest {
  reason: string;
}

export interface GetReleasesQuery {
  page?: number;
  limit?: number;
  status?: string;
  productId?: string;
  platform?: string;
}

export interface GenerateNotesResponse {
  notes: string;
}

export interface ExportNotesResponse {
  downloadUrl: string;
  expiresAt: string;
}
