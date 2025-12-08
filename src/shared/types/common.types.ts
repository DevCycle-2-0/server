export type Platform = "web" | "android" | "ios" | "api" | "desktop";
export type Priority = "low" | "medium" | "high" | "critical";
export type UserRole = "owner" | "admin" | "member" | "viewer";
export type FeatureStatus =
  | "idea"
  | "review"
  | "approved"
  | "planning"
  | "design"
  | "development"
  | "testing"
  | "release"
  | "live"
  | "rejected";
export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "done"
  | "blocked";
export type TaskType =
  | "frontend"
  | "backend"
  | "mobile_android"
  | "mobile_ios"
  | "api"
  | "design"
  | "qa"
  | "devops"
  | "documentation"
  | "other";
export type BugStatus =
  | "new"
  | "confirmed"
  | "in_progress"
  | "fixed"
  | "verified"
  | "closed"
  | "reopened"
  | "wont_fix"
  | "duplicate";
export type BugSeverity = "low" | "medium" | "high" | "critical";
export type SprintStatus = "planning" | "active" | "completed" | "cancelled";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
  };
}
