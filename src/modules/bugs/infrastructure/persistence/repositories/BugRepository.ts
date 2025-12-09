// src/modules/bugs/infrastructure/persistence/repositories/BugRepository.ts
import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  IBugRepository,
  BugFilters,
  BugSortOptions,
  BugStatistics,
} from "@modules/bugs/domain/repositories/IBugRepository";
import {
  Bug,
  BugStatus,
  BugSeverity,
  BugRetestResult,
} from "@modules/bugs/domain/entities/Bug";
import { Priority } from "@modules/features/domain/entities/Feature";
import { Platform } from "@modules/products/domain/entities/Product";
import { BugModel } from "../models/BugModel";
import { Op } from "sequelize";

export class BugRepository
  extends BaseRepository<Bug, BugModel>
  implements IBugRepository
{
  constructor() {
    super(BugModel);
  }

  protected toDomain(model: BugModel): Bug {
    const bug = Bug.create(
      {
        title: model.title,
        description: model.description,
        stepsToReproduce: model.stepsToReproduce,
        expectedBehavior: model.expectedBehavior,
        actualBehavior: model.actualBehavior,
        severity: model.severity as BugSeverity,
        priority: model.priority as Priority,
        productId: model.productId,
        productName: model.productName,
        platform: model.platform as Platform,
        reporterId: model.reporterId,
        reporterName: model.reporterName,
        environment: model.environment,
        workspaceId: model.workspaceId,
        status: model.status as BugStatus,
        featureId: model.featureId,
        featureTitle: model.featureTitle,
        sprintId: model.sprintId,
        sprintName: model.sprintName,
        assigneeId: model.assigneeId,
        assigneeName: model.assigneeName,
        version: model.version,
        browserInfo: model.browserInfo,
      },
      model.id
    );

    // Restore retest results and other fields
    (bug as any).props.retestResults = model.retestResults as BugRetestResult[];
    (bug as any).props.duplicateOf = model.duplicateOf;
    (bug as any).props.resolvedAt = model.resolvedAt;
    (bug as any).props.createdAt = model.createdAt;
    (bug as any).props.updatedAt = model.updatedAt;

    return bug;
  }

  protected toModel(domain: Bug): Partial<BugModel> {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      stepsToReproduce: domain.stepsToReproduce,
      expectedBehavior: domain.expectedBehavior,
      actualBehavior: domain.actualBehavior,
      status: domain.status,
      severity: domain.severity,
      priority: domain.priority,
      productId: domain.productId,
      productName: domain.productName,
      platform: domain.platform,
      featureId: domain.featureId,
      featureTitle: domain.featureTitle,
      sprintId: domain.sprintId,
      sprintName: domain.sprintName,
      reporterId: domain.reporterId,
      reporterName: domain.reporterName,
      assigneeId: domain.assigneeId,
      assigneeName: domain.assigneeName,
      environment: domain.environment,
      version: domain.version,
      browserInfo: domain.browserInfo,
      retestResults: domain.retestResults as any,
      duplicateOf: domain.duplicateOf,
      workspaceId: domain.workspaceId,
      resolvedAt: domain.resolvedAt,
    };
  }

  async findAll(
    filters: BugFilters,
    sortOptions: BugSortOptions,
    page: number,
    limit: number
  ): Promise<{ bugs: Bug[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      const statuses = filters.status.split(",").map((s) => s.trim());
      where.status = { [Op.in]: statuses };
    }

    if (filters.severity) {
      const severities = filters.severity.split(",").map((s) => s.trim());
      where.severity = { [Op.in]: severities };
    }

    if (filters.priority) {
      const priorities = filters.priority.split(",").map((p) => p.trim());
      where.priority = { [Op.in]: priorities };
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.reporterId) {
      where.reporterId = filters.reporterId;
    }

    if (filters.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const order: any[] = [];
    if (sortOptions.sortBy) {
      order.push([sortOptions.sortBy, sortOptions.sortOrder || "asc"]);
    } else {
      order.push(["createdAt", "desc"]);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      bugs: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }

  async getStatistics(
    productId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<BugStatistics> {
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt[Op.gte] = dateFrom;
      }
      if (dateTo) {
        where.createdAt[Op.lte] = dateTo;
      }
    }

    const allBugs = await this.model.findAll({ where });

    const byStatus: Record<BugStatus, number> = {
      new: 0,
      confirmed: 0,
      in_progress: 0,
      fixed: 0,
      verified: 0,
      closed: 0,
      reopened: 0,
      wont_fix: 0,
      duplicate: 0,
    };

    const bySeverity: Record<BugSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let criticalOpen = 0;

    allBugs.forEach((bug) => {
      byStatus[bug.status as BugStatus]++;
      bySeverity[bug.severity as BugSeverity]++;

      if (bug.severity === "critical" && !bug.resolvedAt) {
        criticalOpen++;
      }

      if (bug.resolvedAt) {
        const resolutionTime =
          bug.resolvedAt.getTime() - bug.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    const total = allBugs.length;
    const openBugs = total - resolvedCount;
    const closedBugs = resolvedCount;
    const averageResolutionTime =
      resolvedCount > 0
        ? totalResolutionTime / resolvedCount / (1000 * 60 * 60)
        : 0; // in hours
    const resolutionRate = total > 0 ? (resolvedCount / total) * 100 : 0;

    return {
      total,
      byStatus,
      bySeverity,
      openBugs,
      closedBugs,
      averageResolutionTime,
      criticalOpen,
      resolutionRate,
    };
  }
}
