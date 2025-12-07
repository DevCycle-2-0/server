export enum AppRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum FeatureStage {
  IDEA = "idea",
  DISCOVERY = "discovery",
  PLANNING = "planning",
  DESIGN = "design",
  DEVELOPMENT = "development",
  TESTING = "testing",
  RELEASE = "release",
  LIVE = "live",
}

export enum PriorityLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum ItemStatus {
  BACKLOG = "backlog",
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  CANCELLED = "cancelled",
}

export enum SprintStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ReleaseStatus {
  DRAFT = "draft",
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  STAGED = "staged",
  RELEASED = "released",
  ROLLED_BACK = "rolled_back",
}

export enum BugSeverity {
  CRITICAL = "critical",
  MAJOR = "major",
  MINOR = "minor",
  TRIVIAL = "trivial",
}

export enum SubscriptionPlan {
  FREE = "free",
  STARTER = "starter",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

export interface JwtPayload {
  userId: string;
  email: string;
  workspaceId?: string;
  role?: AppRole;
}
