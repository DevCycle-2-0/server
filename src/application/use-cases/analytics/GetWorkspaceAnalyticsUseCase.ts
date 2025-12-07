import { FeatureModel } from "@infrastructure/database/models/FeatureModel";
import { TaskModel } from "@infrastructure/database/models/TaskModel";
import { BugModel } from "@infrastructure/database/models/BugModel";
import { SprintModel } from "@infrastructure/database/models/SprintModel";
import { ItemStatus, SprintStatus } from "@shared/types";
import { Op } from "sequelize";

export class GetWorkspaceAnalyticsUseCase {
  async execute(workspaceId: string, period: string = "30d") {
    const periodDate = this.getPeriodDate(period);

    // Features analytics
    const totalFeatures = await FeatureModel.count({ where: { workspaceId } });
    const completedFeatures = await FeatureModel.count({
      where: {
        workspaceId,
        status: ItemStatus.DONE,
        completedAt: { [Op.gte]: periodDate },
      },
    });

    // Tasks analytics
    const totalTasks = await TaskModel.count({ where: { workspaceId } });
    const completedTasks = await TaskModel.count({
      where: {
        workspaceId,
        status: ItemStatus.DONE,
        completedAt: { [Op.gte]: periodDate },
      },
    });

    // Bugs analytics
    const totalBugs = await BugModel.count({ where: { workspaceId } });
    const resolvedBugs = await BugModel.count({
      where: {
        workspaceId,
        status: ItemStatus.DONE,
        resolvedAt: { [Op.gte]: periodDate },
      },
    });

    // Sprint analytics
    const activeSprints = await SprintModel.findAll({
      where: {
        workspaceId,
        status: SprintStatus.ACTIVE,
      },
    });

    const completedSprints = await SprintModel.findAll({
      where: {
        workspaceId,
        status: SprintStatus.COMPLETED,
        updatedAt: { [Op.gte]: periodDate },
      },
      order: [["updatedAt", "DESC"]],
      limit: 5,
    });

    const avgVelocity =
      completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) /
      (completedSprints.length || 1);

    return {
      period: {
        start: periodDate,
        end: new Date(),
        label: this.getPeriodLabel(period),
      },
      summary: {
        features: {
          total: totalFeatures,
          completed: completedFeatures,
          completionRate:
            totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate:
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        },
        bugs: {
          total: totalBugs,
          resolved: resolvedBugs,
          resolutionRate: totalBugs > 0 ? (resolvedBugs / totalBugs) * 100 : 0,
        },
        velocity: {
          average: Math.round(avgVelocity),
          sprints: completedSprints.length,
        },
      },
      activeSprints: activeSprints.map((s) => ({
        id: s.id,
        name: s.name,
        progress:
          s.capacityPoints > 0
            ? Math.round((s.completedPoints / s.capacityPoints) * 100)
            : 0,
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (new Date(s.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        ),
      })),
    };
  }

  private getPeriodDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case "7d":
        return new Date(now.setDate(now.getDate() - 7));
      case "30d":
        return new Date(now.setDate(now.getDate() - 30));
      case "90d":
        return new Date(now.setDate(now.getDate() - 90));
      case "1y":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }

  private getPeriodLabel(period: string): string {
    switch (period) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "1y":
        return "Last year";
      default:
        return "Last 30 days";
    }
  }
}
