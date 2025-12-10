export interface DashboardStats {
  activeSprints: number;
  pendingTasks: number;
  openBugs: number;
  upcomingReleases: number;
  teamAvailability: {
    available: number;
    busy: number;
    away: number;
    offline: number;
  };
  recentActivity: {
    tasksCompletedToday: number;
    bugsFixedToday: number;
    featuresApprovedToday: number;
  };
}

export interface ActivityItem {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: "task" | "bug" | "feature" | "sprint" | "release";
  entityId: string;
  entityTitle: string;
  action: string;
  timestamp: string;
}

export interface SprintSummary {
  id: string;
  name: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining: number;
  velocity: number;
  teamMembers: number;
}

export interface GetActivityQuery {
  page?: number;
  limit?: number;
  type?: string;
}
