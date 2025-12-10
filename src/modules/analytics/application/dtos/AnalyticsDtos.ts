export interface AnalyticsOverview {
  totalFeatures: number;
  completedFeatures: number;
  totalBugs: number;
  resolvedBugs: number;
  totalTasks: number;
  completedTasks: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  averageVelocity: number;
  averageBugResolutionTime: number;
}

export interface VelocityDataPoint {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  date: string;
}

export interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

export interface BugResolutionData {
  period: string;
  opened: number;
  resolved: number;
  averageTime: number;
}

export interface FeatureCompletionData {
  period: string;
  completed: number;
  planned: number;
  completionRate: number;
}

export interface ReleaseFrequencyData {
  period: string;
  releases: number;
  rollbacks: number;
}

export interface TeamWorkloadData {
  memberId: string;
  memberName: string;
  tasksCount: number;
  bugsCount: number;
  hoursLogged: number;
  utilizationPercent: number;
}

export interface TimeTrackingData {
  period: string;
  totalHours: number;
  billableHours: number;
  byProject: Record<string, number>;
}

export interface ProductHealthData {
  productId: string;
  productName: string;
  healthScore: number;
  openBugs: number;
  criticalBugs: number;
  featuresInProgress: number;
  lastReleaseDate?: string;
}

export interface TeamPerformanceData {
  memberId: string;
  memberName: string;
  tasksCompleted: number;
  bugsFixed: number;
  codeReviews: number;
  hoursLogged: number;
  onTimeDelivery: number;
}

export interface ExportRequest {
  type: "velocity" | "burndown" | "bugs" | "features" | "time" | "team";
  format: "csv" | "xlsx" | "pdf";
  startDate?: string;
  endDate?: string;
  filters?: Record<string, string>;
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface GetAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  productId?: string;
  sprintId?: string;
  userId?: string;
  limit?: number;
}
