import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  IActivityRepository,
  ActivityFilters,
} from "@modules/dashboard/domain/repositories/IActivityRepository";
import { Activity } from "@modules/dashboard/domain/entities/Activity";
import { ActivityModel } from "../models/ActivityModel";
import { PaginationParams } from "@shared/application/PaginationParams";
import { Op } from "sequelize";

export class ActivityRepository
  extends BaseRepository<Activity, ActivityModel>
  implements IActivityRepository
{
  constructor() {
    super(ActivityModel);
  }

  protected toDomain(model: ActivityModel): Activity {
    return Activity.create(
      {
        workspaceId: model.workspaceId,
        userId: model.userId,
        userName: model.userName,
        userAvatar: model.userAvatar,
        entityType: model.entityType as any,
        entityId: model.entityId,
        entityTitle: model.entityTitle,
        action: model.action,
        metadata: model.metadata,
      },
      model.id
    );
  }

  protected toModel(domain: Activity): Partial<ActivityModel> {
    return {
      id: domain.id,
      workspaceId: domain.workspaceId,
      userId: domain.userId,
      userName: domain.userName,
      userAvatar: domain.userAvatar,
      entityType: domain.entityType,
      entityId: domain.entityId,
      entityTitle: domain.entityTitle,
      action: domain.action,
      metadata: domain.metadata,
    };
  }

  async findAll(
    filters: ActivityFilters,
    pagination: PaginationParams
  ): Promise<{ activities: Activity[]; total: number }> {
    const where: any = { workspaceId: filters.workspaceId };

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    });

    return {
      activities: rows.map((row) => this.toDomain(row)),
      total: count,
    };
  }

  async findRecent(workspaceId: string, limit: number): Promise<Activity[]> {
    const models = await this.model.findAll({
      where: { workspaceId },
      order: [["createdAt", "DESC"]],
      limit,
    });

    return models.map((model) => this.toDomain(model));
  }

  async deleteOldActivities(
    workspaceId: string,
    daysToKeep: number
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deleted = await this.model.destroy({
      where: {
        workspaceId,
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return deleted;
  }
}
