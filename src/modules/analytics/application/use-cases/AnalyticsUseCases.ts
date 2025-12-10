import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IFeatureRepository } from "@modules/features/domain/repositories/IFeatureRepository";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { ISprintRepository } from "@modules/sprints/domain/repositories/ISprintRepository";
import { ITeamRepository } from "@modules/team/domain/repositories/ITeamRepository";
import { IReleaseRepository } from "@modules/releases/domain/repositories/IReleaseRepository";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import {
  AnalyticsOverview,
  VelocityDataPoint,
  BurndownDataPoint,
  BugResolutionData,
  FeatureCompletionData,
  ReleaseFrequencyData,
  TeamWorkloadData,
  TimeTrackingData,
  ProductHealthData,
  TeamPerformanceData,
} from "../dtos/AnalyticsDtos";

// Get Analytics Overview
interface GetOverviewInput {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetAnalyticsOverviewUseCase
  implements UseCase<GetOverviewInput, Result<AnalyticsOverview>>
{
  constructor(
    private featureRepository: IFeatureRepository,
    private bugRepository: IBugRepository,
    private taskRepository: ITaskRepository,
    private sprintRepository: ISprintRepository,
    private teamRepository: ITeamRepository
  ) {}

  async execute(input: GetOverviewInput): Promise<Result<AnalyticsOverview>> {
    // Get all features
    const { features } = await this.featureRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Get all bugs
    const { bugs } = await this.bugRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Get all tasks
    const { tasks } = await this.taskRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Get all sprints
    const { sprints } = await this.sprintRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Get team members
    const teamMembers = await this.teamRepository.findAll({
      workspaceId: input.workspaceId,
    });

    // Calculate metrics
    const totalFeatures = features.length;
    const completedFeatures = features.filter(
      (f) => f.status === "live"
    ).length;

    const totalBugs = bugs.length;
    const resolvedBugs = bugs.filter((b) =>
      ["fixed", "verified", "closed"].includes(b.status)
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;

    const activeSprintsCount = sprints.filter(
      (s) => s.status === "active"
    ).length;

    const teamMembersCount = teamMembers.filter(
      (m) => m.status === "active"
    ).length;

    // Calculate average velocity
    const completedSprints = sprints.filter((s) => s.status === "completed");
    const averageVelocity =
      completedSprints.length > 0
        ? completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) /
          completedSprints.length
        : 0;

    // Calculate average bug resolution time
    const resolvedBugsWithTime = bugs.filter(
      (b) => b.resolvedAt && b.createdAt
    );
    const averageBugResolutionTime =
      resolvedBugsWithTime.length > 0
        ? resolvedBugsWithTime.reduce((sum, b) => {
            const resolutionTime =
              b.resolvedAt!.getTime() - b.createdAt.getTime();
            return sum + resolutionTime / (1000 * 60 * 60); // Convert to hours
          }, 0) / resolvedBugsWithTime.length
        : 0;

    const overview: AnalyticsOverview = {
      totalFeatures,
      completedFeatures,
      totalBugs,
      resolvedBugs,
      totalTasks,
      completedTasks,
      activeSprintsCount,
      teamMembersCount,
      averageVelocity: Math.round(averageVelocity * 100) / 100,
      averageBugResolutionTime:
        Math.round(averageBugResolutionTime * 100) / 100,
    };

    return Result.ok<AnalyticsOverview>(overview);
  }
}

// Get Velocity Data
interface GetVelocityInput {
  workspaceId: string;
  limit?: number;
}

export class GetVelocityDataUseCase
  implements UseCase<GetVelocityInput, Result<VelocityDataPoint[]>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: GetVelocityInput): Promise<Result<VelocityDataPoint[]>> {
    const limit = input.limit || 10;

    const { sprints } = await this.sprintRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: "startDate", sortOrder: "desc" },
      1,
      limit
    );

    const velocityData: VelocityDataPoint[] = sprints.map((sprint) => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      planned: sprint.capacity,
      completed: sprint.velocity || 0,
      date: sprint.startDate.toISOString(),
    }));

    return Result.ok<VelocityDataPoint[]>(velocityData.reverse());
  }
}

// Get Burndown Data
interface GetBurndownInput {
  sprintId: string;
  workspaceId: string;
}

export class GetBurndownDataUseCase
  implements UseCase<GetBurndownInput, Result<BurndownDataPoint[]>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: GetBurndownInput): Promise<Result<BurndownDataPoint[]>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<BurndownDataPoint[]>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<BurndownDataPoint[]>("Sprint not found");
    }

    const metrics: any = await this.sprintRepository.getMetrics(input.sprintId);
    return Result.ok<BurndownDataPoint[]>(metrics.burndownData);
  }
}

// Get Bug Resolution Trends
interface GetBugResolutionInput {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}

export class GetBugResolutionTrendsUseCase
  implements UseCase<GetBugResolutionInput, Result<BugResolutionData[]>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(
    input: GetBugResolutionInput
  ): Promise<Result<BugResolutionData[]>> {
    const { bugs } = await this.bugRepository.findAll(
      {
        workspaceId: input.workspaceId,
        productId: input.productId,
      },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Group by month
    const monthlyData = new Map<
      string,
      { opened: number; resolved: number; resolutionTimes: number[] }
    >();

    bugs.forEach((bug) => {
      const createdMonth = bug.createdAt.toISOString().substring(0, 7);

      if (!monthlyData.has(createdMonth)) {
        monthlyData.set(createdMonth, {
          opened: 0,
          resolved: 0,
          resolutionTimes: [],
        });
      }
      monthlyData.get(createdMonth)!.opened++;

      if (bug.resolvedAt) {
        const resolvedMonth = bug.resolvedAt.toISOString().substring(0, 7);
        if (!monthlyData.has(resolvedMonth)) {
          monthlyData.set(resolvedMonth, {
            opened: 0,
            resolved: 0,
            resolutionTimes: [],
          });
        }
        monthlyData.get(resolvedMonth)!.resolved++;

        const resolutionTime =
          (bug.resolvedAt.getTime() - bug.createdAt.getTime()) /
          (1000 * 60 * 60);
        monthlyData.get(resolvedMonth)!.resolutionTimes.push(resolutionTime);
      }
    });

    const trends: BugResolutionData[] = Array.from(monthlyData.entries())
      .sort()
      .map(([period, data]) => ({
        period,
        opened: data.opened,
        resolved: data.resolved,
        averageTime:
          data.resolutionTimes.length > 0
            ? Math.round(
                (data.resolutionTimes.reduce((a, b) => a + b, 0) /
                  data.resolutionTimes.length) *
                  100
              ) / 100
            : 0,
      }));

    return Result.ok<BugResolutionData[]>(trends);
  }
}

// Get Feature Completion Data
interface GetFeatureCompletionInput {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetFeatureCompletionDataUseCase
  implements
    UseCase<GetFeatureCompletionInput, Result<FeatureCompletionData[]>>
{
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(
    input: GetFeatureCompletionInput
  ): Promise<Result<FeatureCompletionData[]>> {
    const { features } = await this.featureRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Group by month
    const monthlyData = new Map<
      string,
      { completed: number; planned: number }
    >();

    features.forEach((feature) => {
      const createdMonth = feature.createdAt.toISOString().substring(0, 7);

      if (!monthlyData.has(createdMonth)) {
        monthlyData.set(createdMonth, { completed: 0, planned: 0 });
      }
      monthlyData.get(createdMonth)!.planned++;

      if (feature.completedAt) {
        const completedMonth = feature.completedAt
          .toISOString()
          .substring(0, 7);
        if (!monthlyData.has(completedMonth)) {
          monthlyData.set(completedMonth, { completed: 0, planned: 0 });
        }
        monthlyData.get(completedMonth)!.completed++;
      }
    });

    const completionData: FeatureCompletionData[] = Array.from(
      monthlyData.entries()
    )
      .sort()
      .map(([period, data]) => ({
        period,
        completed: data.completed,
        planned: data.planned,
        completionRate:
          data.planned > 0
            ? Math.round((data.completed / data.planned) * 10000) / 100
            : 0,
      }));

    return Result.ok<FeatureCompletionData[]>(completionData);
  }
}

// Get Release Frequency
interface GetReleaseFrequencyInput {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetReleaseFrequencyUseCase
  implements UseCase<GetReleaseFrequencyInput, Result<ReleaseFrequencyData[]>>
{
  constructor(private releaseRepository: IReleaseRepository) {}

  async execute(
    input: GetReleaseFrequencyInput
  ): Promise<Result<ReleaseFrequencyData[]>> {
    const { releases } = await this.releaseRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    const monthlyData = new Map<
      string,
      { releases: number; rollbacks: number }
    >();

    releases.forEach((release) => {
      if (release.releaseDate) {
        const month = release.releaseDate.toISOString().substring(0, 7);

        if (!monthlyData.has(month)) {
          monthlyData.set(month, { releases: 0, rollbacks: 0 });
        }

        if (release.status === "released") {
          monthlyData.get(month)!.releases++;
        } else if (release.status === "rolled_back") {
          monthlyData.get(month)!.rollbacks++;
        }
      }
    });

    const frequencyData: ReleaseFrequencyData[] = Array.from(
      monthlyData.entries()
    )
      .sort()
      .map(([period, data]) => ({
        period,
        releases: data.releases,
        rollbacks: data.rollbacks,
      }));

    return Result.ok<ReleaseFrequencyData[]>(frequencyData);
  }
}

// Get Team Workload
interface GetTeamWorkloadInput {
  workspaceId: string;
}

export class GetTeamWorkloadUseCase
  implements UseCase<GetTeamWorkloadInput, Result<TeamWorkloadData[]>>
{
  constructor(
    private teamRepository: ITeamRepository,
    private taskRepository: ITaskRepository,
    private bugRepository: IBugRepository
  ) {}

  async execute(
    input: GetTeamWorkloadInput
  ): Promise<Result<TeamWorkloadData[]>> {
    const members = await this.teamRepository.findAll({
      workspaceId: input.workspaceId,
      status: "active",
    });

    const workloadData: TeamWorkloadData[] = [];

    for (const member of members) {
      const { tasks } = await this.taskRepository.findAll(
        { assigneeId: member.userId, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const { bugs } = await this.bugRepository.findAll(
        { assigneeId: member.userId, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const hoursLogged = tasks.reduce((sum, t) => sum + t.loggedHours, 0);
      const capacity = 40; // Standard work week
      const utilizationPercent = (hoursLogged / capacity) * 100;

      workloadData.push({
        memberId: member.id,
        memberName: member.name,
        tasksCount: tasks.length,
        bugsCount: bugs.length,
        hoursLogged: Math.round(hoursLogged * 100) / 100,
        utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      });
    }

    return Result.ok<TeamWorkloadData[]>(workloadData);
  }
}

// Get Time Tracking Data
interface GetTimeTrackingInput {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

export class GetTimeTrackingDataUseCase
  implements UseCase<GetTimeTrackingInput, Result<TimeTrackingData[]>>
{
  constructor(
    private taskRepository: ITaskRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(
    input: GetTimeTrackingInput
  ): Promise<Result<TimeTrackingData[]>> {
    const { tasks } = await this.taskRepository.findAll(
      {
        workspaceId: input.workspaceId,
        assigneeId: input.userId,
      },
      { sortBy: undefined, sortOrder: undefined },
      1,
      10000
    );

    // Group by month
    const monthlyData = new Map<
      string,
      { totalHours: number; byProduct: Map<string, number> }
    >();

    for (const task of tasks) {
      const month = task.createdAt.toISOString().substring(0, 7);

      if (!monthlyData.has(month)) {
        monthlyData.set(month, { totalHours: 0, byProduct: new Map() });
      }

      const data = monthlyData.get(month)!;
      data.totalHours += task.loggedHours;

      // For simplicity, all hours are billable in this example
    }

    const timeData: TimeTrackingData[] = Array.from(monthlyData.entries())
      .sort()
      .map(([period, data]) => ({
        period,
        totalHours: Math.round(data.totalHours * 100) / 100,
        billableHours: Math.round(data.totalHours * 100) / 100,
        byProject: {},
      }));

    return Result.ok<TimeTrackingData[]>(timeData);
  }
}

// Get Product Health
interface GetProductHealthInput {
  workspaceId: string;
}

export class GetProductHealthUseCase
  implements UseCase<GetProductHealthInput, Result<ProductHealthData[]>>
{
  constructor(
    private productRepository: IProductRepository,
    private bugRepository: IBugRepository,
    private featureRepository: IFeatureRepository,
    private releaseRepository: IReleaseRepository
  ) {}

  async execute(
    input: GetProductHealthInput
  ): Promise<Result<ProductHealthData[]>> {
    const { products } = await this.productRepository.findAll(
      { workspaceId: input.workspaceId },
      { sortBy: undefined, sortOrder: undefined },
      1,
      1000
    );

    const healthData: ProductHealthData[] = [];

    for (const product of products) {
      const { bugs } = await this.bugRepository.findAll(
        { productId: product.id, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const { features } = await this.featureRepository.findAll(
        { productId: product.id, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const { releases } = await this.releaseRepository.findAll(
        { productId: product.id, workspaceId: input.workspaceId },
        { sortBy: "releaseDate", sortOrder: "desc" },
        1,
        1
      );

      const openBugs = bugs.filter(
        (b) => !["fixed", "verified", "closed"].includes(b.status)
      ).length;
      const criticalBugs = bugs.filter(
        (b) => b.severity === "critical" && !b.resolvedAt
      ).length;
      const featuresInProgress = features.filter((f) =>
        ["development", "testing"].includes(f.status)
      ).length;

      // Calculate health score (0-100)
      let healthScore = 100;
      healthScore -= criticalBugs * 10; // -10 per critical bug
      healthScore -= openBugs * 2; // -2 per open bug
      healthScore = Math.max(0, Math.min(100, healthScore));

      healthData.push({
        productId: product.id,
        productName: product.name,
        healthScore: Math.round(healthScore),
        openBugs,
        criticalBugs,
        featuresInProgress,
        lastReleaseDate:
          releases.length > 0 && releases[0].releaseDate
            ? releases[0].releaseDate.toISOString()
            : undefined,
      });
    }

    return Result.ok<ProductHealthData[]>(healthData);
  }
}

// Get Team Performance
interface GetTeamPerformanceInput {
  workspaceId: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetTeamPerformanceUseCase
  implements UseCase<GetTeamPerformanceInput, Result<TeamPerformanceData[]>>
{
  constructor(
    private teamRepository: ITeamRepository,
    private taskRepository: ITaskRepository,
    private bugRepository: IBugRepository
  ) {}

  async execute(
    input: GetTeamPerformanceInput
  ): Promise<Result<TeamPerformanceData[]>> {
    const members = await this.teamRepository.findAll({
      workspaceId: input.workspaceId,
      status: "active",
    });

    const performanceData: TeamPerformanceData[] = [];

    for (const member of members) {
      if (input.userId && member.userId !== input.userId) {
        continue;
      }

      const { tasks } = await this.taskRepository.findAll(
        { assigneeId: member.userId, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const { bugs } = await this.bugRepository.findAll(
        { assigneeId: member.userId, workspaceId: input.workspaceId },
        { sortBy: undefined, sortOrder: undefined },
        1,
        10000
      );

      const tasksCompleted = tasks.filter((t) => t.status === "done").length;
      const bugsFixed = bugs.filter((b) =>
        ["fixed", "verified", "closed"].includes(b.status)
      ).length;
      const hoursLogged = tasks.reduce((sum, t) => sum + t.loggedHours, 0);

      // Calculate on-time delivery
      const tasksWithDueDate = tasks.filter((t) => t.dueDate && t.completedAt);
      const onTimeCount = tasksWithDueDate.filter(
        (t) => t.completedAt! <= t.dueDate!
      ).length;
      const onTimeDelivery =
        tasksWithDueDate.length > 0
          ? Math.round((onTimeCount / tasksWithDueDate.length) * 10000) / 100
          : 0;

      performanceData.push({
        memberId: member.id,
        memberName: member.name,
        tasksCompleted,
        bugsFixed,
        codeReviews: 0, // Placeholder
        hoursLogged: Math.round(hoursLogged * 100) / 100,
        onTimeDelivery,
      });
    }

    return Result.ok<TeamPerformanceData[]>(performanceData);
  }
}

// Export Analytics
interface ExportAnalyticsInput {
  workspaceId: string;
  type: string;
  format: string;
  startDate?: Date;
  endDate?: Date;
}

export class ExportAnalyticsUseCase
  implements
    UseCase<
      ExportAnalyticsInput,
      Result<{ downloadUrl: string; expiresAt: string }>
    >
{
  async execute(
    input: ExportAnalyticsInput
  ): Promise<Result<{ downloadUrl: string; expiresAt: string }>> {
    // In a real implementation, this would generate the file and upload to storage
    const downloadUrl = `https://storage.example.com/exports/${
      input.type
    }-${Date.now()}.${input.format}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return Result.ok({
      downloadUrl,
      expiresAt: expiresAt.toISOString(),
    });
  }
}
