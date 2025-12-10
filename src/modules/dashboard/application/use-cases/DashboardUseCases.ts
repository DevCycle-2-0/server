import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { ISprintRepository } from "@modules/sprints/domain/repositories/ISprintRepository";
import { IReleaseRepository } from "@modules/releases/domain/repositories/IReleaseRepository";
import { ITeamRepository } from "@modules/team/domain/repositories/ITeamRepository";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { IActivityRepository } from "@modules/dashboard/domain/repositories/IActivityRepository";
import {
  DashboardStats,
  ActivityItem,
  SprintSummary,
  GetActivityQuery,
} from "../dtos/DashboardDtos";
import { PaginatedResponse } from "@shared/application/PaginatedResponse";

// Get Dashboard Stats
interface GetStatsInput {
  workspaceId: string;
}

export class GetDashboardStatsUseCase
  implements UseCase<GetStatsInput, Result<DashboardStats>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private bugRepository: IBugRepository,
    private sprintRepository: ISprintRepository,
    private releaseRepository: IReleaseRepository,
    private teamRepository: ITeamRepository,
    private featureRepository: IFeatureRepository
  ) {}

  async execute(input: GetStatsInput): Promise<Result<DashboardStats>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active sprints
    const { sprints: activeSprints } = await this.sprintRepository.findAll(
      { workspaceId: input.workspaceId, status: "active" },
      { sortBy: undefined, sortOrder: undefined },
      1,
      1000
    );

    // Get pending tasks
    const { tasks: pendingTasks } = await this.taskRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );
    const pendingCount = pendingTasks.filter(
      (t) => !["done", "cancelled"].includes(t.status)
    ).length;

    // Get open bugs
    const { bugs: openBugs } = await this.bugRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );
    const openBugsCount = openBugs.filter(
      (b) => !["fixed", "verified", "closed"].includes(b.status)
    ).length;

    // Get upcoming releases
    const { releases } = await this.releaseRepository.findAll(
      { workspaceId: input.workspaceId, status: "staged" }, // ← Change "scheduled" to "staged"
      { sortBy: "releaseDate", sortOrder: "asc" },
      1,
      1000
    );
    const upcomingCount = releases.filter(
      (r) => r.releaseDate && r.releaseDate > new Date()
    ).length;

    // Get team availability
    const teamMembers = await this.teamRepository.findAll({
      workspaceId: input.workspaceId,
      status: "active",
    });
    const availability = {
      available: teamMembers.filter((m: any) => m.availability === "available")
        .length,
      busy: teamMembers.filter((m: any) => m.availability === "busy").length,
      away: teamMembers.filter((m: any) => m.availability === "away").length,
      offline: teamMembers.filter((m: any) => m.availability === "offline")
        .length,
    };

    // Get today's activity
    const tasksCompletedToday = pendingTasks.filter(
      (t) => t.completedAt && t.completedAt >= today
    ).length;

    const bugsFixedToday = openBugs.filter(
      (b) => b.resolvedAt && b.resolvedAt >= today
    ).length;

    const { features } = await this.featureRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );
    const featuresApprovedToday = features.filter(
      (f: any) => f.approvedAt && f.approvedAt >= today
    ).length;

    const stats: DashboardStats = {
      activeSprints: activeSprints.length,
      pendingTasks: pendingCount,
      openBugs: openBugsCount,
      upcomingReleases: upcomingCount,
      teamAvailability: availability,
      recentActivity: {
        tasksCompletedToday,
        bugsFixedToday,
        featuresApprovedToday,
      },
    };

    return Result.ok<DashboardStats>(stats);
  }
}

// Get Activity Feed
interface GetActivityInput {
  workspaceId: string;
  query: GetActivityQuery;
}

export class GetActivityFeedUseCase
  implements UseCase<GetActivityInput, Result<PaginatedResponse<ActivityItem>>>
{
  constructor(private activityRepository: IActivityRepository) {}

  async execute(
    input: GetActivityInput
  ): Promise<Result<PaginatedResponse<ActivityItem>>> {
    const page = input.query.page || 1;
    const limit = input.query.limit || 20;

    const { activities, total } = await this.activityRepository.findAll(
      {
        workspaceId: input.workspaceId,
        entityType: input.query.type,
      },
      { page, limit }
    );

    const items: ActivityItem[] = activities.map((activity) => ({
      id: activity.id,
      type: activity.entityType,
      userId: activity.userId,
      userName: activity.userName,
      userAvatar: activity.userAvatar,
      entityType: activity.entityType,
      entityId: activity.entityId,
      entityTitle: activity.entityTitle,
      action: activity.action,
      timestamp: activity.createdAt.toISOString(),
    }));

    return Result.ok<PaginatedResponse<ActivityItem>>({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}

// Get Sprint Summary
interface GetSprintSummaryInput {
  workspaceId: string;
}

export class GetSprintSummaryUseCase
  implements UseCase<GetSprintSummaryInput, Result<SprintSummary[]>>
{
  constructor(
    private sprintRepository: ISprintRepository,
    private taskRepository: ITaskRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(
    input: GetSprintSummaryInput
  ): Promise<Result<SprintSummary[]>> {
    const { sprints } = await this.sprintRepository.findAll(
      { workspaceId: input.workspaceId, status: "active" },
      { sortBy: "startDate", sortOrder: "desc" },
      1,
      100
    );

    const summaries: SprintSummary[] = [];

    for (const sprint of sprints) {
      const { tasks } = await this.taskRepository.findAll(
        { workspaceId: input.workspaceId, sprintId: sprint.id },
        { sortBy: undefined, sortOrder: undefined },
        1,
        1000
      );

      const tasksTotal = tasks.length;
      const tasksCompleted = tasks.filter((t) => t.status === "done").length;
      const progress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

      // Calculate days remaining
      const now = new Date();
      const endDate = sprint.endDate;
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Get team members in sprint
      const teamMembers = await this.teamRepository.findAll({
        workspaceId: input.workspaceId,
        status: "active",
      });

      // Get unique assignees from sprint tasks
      const assigneeIds = new Set(
        tasks.map((t) => t.assigneeId).filter((id) => id !== undefined)
      );

      summaries.push({
        id: sprint.id,
        name: sprint.name,
        progress: Math.round(progress),
        tasksTotal,
        tasksCompleted,
        daysRemaining,
        velocity: sprint.velocity || 0,
        teamMembers: assigneeIds.size || teamMembers.length,
      });
    }

    return Result.ok<SprintSummary[]>(summaries);
  }
}

// Record Activity (helper use case)
interface RecordActivityInput {
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: "task" | "bug" | "feature" | "sprint" | "release";
  entityId: string;
  entityTitle: string;
  action: string;
  metadata?: Record<string, any>;
}

export class RecordActivityUseCase
  implements UseCase<RecordActivityInput, Result<void>>
{
  constructor(private activityRepository: IActivityRepository) {}

  async execute(input: RecordActivityInput): Promise<Result<void>> {
    const { Activity } = await import(
      "@modules/dashboard/domain/entities/Activity"
    );

    const activity = Activity.create({
      workspaceId: input.workspaceId,
      userId: input.userId,
      userName: input.userName,
      userAvatar: input.userAvatar,
      entityType: input.entityType,
      entityId: input.entityId,
      entityTitle: input.entityTitle,
      action: input.action,
      metadata: input.metadata,
    });

    await this.activityRepository.save(activity);
    return Result.ok<void>();
  }
}
