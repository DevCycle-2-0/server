import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  ISprintRepository,
  SprintFilters,
  SprintSortOptions,
  SprintMetrics,
  BurndownPoint,
} from "@modules/sprints/domain/repositories/ISprintRepository";
import {
  Sprint,
  SprintStatus,
  SprintRetrospective,
} from "@modules/sprints/domain/entities/Sprint";
import { SprintModel } from "../models/SprintModel";
import { TaskModel } from "@modules/tasks/infrastructure/persistence/models/TaskModel";
import { BugModel } from "@modules/bugs/infrastructure/persistence/models/BugModel";
import { Op } from "sequelize";

export class SprintRepository
  extends BaseRepository<Sprint, SprintModel>
  implements ISprintRepository
{
  constructor() {
    super(SprintModel);
  }

  protected toDomain(model: SprintModel): Sprint {
    const sprint = Sprint.create(
      {
        name: model.name,
        goal: model.goal,
        productId: model.productId,
        productName: model.productName,
        startDate: model.startDate,
        endDate: model.endDate,
        capacity: Number(model.capacity), // Convert from DECIMAL
        workspaceId: model.workspaceId,
        status: model.status as SprintStatus,
        taskIds: model.taskIds,
        bugIds: model.bugIds,
        velocity: model.velocity ? Number(model.velocity) : undefined,
      },
      model.id
    );

    // Restore retrospective and timestamps
    (sprint as any).props.retrospective = model.retrospective as
      | SprintRetrospective
      | undefined;
    (sprint as any).props.createdAt = model.createdAt;
    (sprint as any).props.updatedAt = model.updatedAt;

    return sprint;
  }

  protected toModel(domain: Sprint): Partial<SprintModel> {
    const modelData = {
      id: domain.id,
      name: domain.name,
      goal: domain.goal,
      productId: domain.productId,
      productName: domain.productName,
      status: domain.status,
      startDate: domain.startDate,
      endDate: domain.endDate,
      taskIds: domain.taskIds,
      bugIds: domain.bugIds,
      capacity: domain.capacity, // Make sure this is here!
      velocity: domain.velocity,
      retrospective: domain.retrospective as any,
      workspaceId: domain.workspaceId,
    };

    // Debug logging
    console.log(
      "🔍 SprintRepository.toModel - capacity value:",
      domain.capacity
    );
    console.log(
      "🔍 SprintRepository.toModel - full modelData:",
      JSON.stringify(modelData, null, 2)
    );

    return modelData;
  }

  async findAll(
    filters: SprintFilters,
    sortOptions: SprintSortOptions,
    page: number,
    limit: number
  ): Promise<{ sprints: Sprint[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      const statuses = filters.status.split(",").map((s) => s.trim());
      where.status = { [Op.in]: statuses };
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    const order: any[] = [];
    if (sortOptions.sortBy) {
      order.push([sortOptions.sortBy, sortOptions.sortOrder || "asc"]);
    } else {
      order.push(["startDate", "desc"]);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      sprints: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }

  async getMetrics(sprintId: string): Promise<SprintMetrics> {
    const sprint = await this.model.findByPk(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Get all tasks in sprint
    const tasks = await TaskModel.findAll({
      where: {
        id: { [Op.in]: sprint.taskIds.length > 0 ? sprint.taskIds : [""] },
      },
    });

    // Get all bugs in sprint
    const bugs = await BugModel.findAll({
      where: {
        id: { [Op.in]: sprint.bugIds.length > 0 ? sprint.bugIds : [""] },
      },
    });

    // Calculate task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;

    // Calculate bug metrics
    const totalBugs = bugs.length;
    const fixedBugs = bugs.filter((b) =>
      ["fixed", "verified", "closed"].includes(b.status)
    ).length;

    // Calculate points (estimated hours)
    const totalPoints = tasks.reduce(
      (sum, t) => sum + (Number(t.estimatedHours) || 0),
      0
    );
    const completedPoints = tasks
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);

    // Calculate blocked items
    const blockedItems = tasks.filter((t) => t.status === "blocked").length;

    // Generate burndown data
    const burndownData = this.generateBurndownData(
      sprint.startDate,
      sprint.endDate,
      totalPoints,
      completedPoints
    );

    // Velocity trend (placeholder - would need historical data)
    const velocityTrend: number[] = [];

    return {
      totalTasks,
      completedTasks,
      totalBugs,
      fixedBugs,
      totalPoints,
      completedPoints,
      burndownData,
      velocityTrend,
      blockedItems,
    };
  }

  private generateBurndownData(
    startDate: Date,
    endDate: Date,
    totalPoints: number,
    completedPoints: number
  ): BurndownPoint[] {
    const data: BurndownPoint[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0) return data;

    const idealBurnRate = totalPoints / totalDays;

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + day);

      const ideal = Math.max(0, totalPoints - idealBurnRate * day);

      // For remaining, we'd need actual daily completion data
      // This is a simplified calculation
      const remaining =
        day === totalDays ? totalPoints - completedPoints : ideal;

      data.push({
        date: currentDate.toISOString().split("T")[0],
        remaining: Math.round(remaining * 100) / 100,
        ideal: Math.round(ideal * 100) / 100,
      });
    }

    return data;
  }
}
