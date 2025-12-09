// src/modules/features/infrastructure/persistence/repositories/FeatureRepository.ts
import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  IFeatureRepository,
  FeatureFilters,
  FeatureSortOptions,
} from "@modules/features/domain/repositories/IFeatureRepository";
import {
  Feature,
  FeatureStatus,
  Priority,
} from "@modules/features/domain/entities/Feature";
import { Platform } from "@modules/products/domain/entities/Product";
import { FeatureModel } from "../models/FeatureModel";
import { Op } from "sequelize";

export class FeatureRepository
  extends BaseRepository<Feature, FeatureModel>
  implements IFeatureRepository
{
  constructor() {
    super(FeatureModel);
  }

  protected toDomain(model: FeatureModel): Feature {
    return Feature.create(
      {
        title: model.title,
        description: model.description,
        priority: model.priority as Priority,
        productId: model.productId,
        productName: model.productName,
        platform: model.platform as Platform,
        requestedBy: model.requestedBy,
        requestedByName: model.requestedByName,
        workspaceId: model.workspaceId,
        status: model.status as FeatureStatus,
        assigneeId: model.assigneeId,
        assigneeName: model.assigneeName,
        sprintId: model.sprintId,
        sprintName: model.sprintName,
        estimatedHours: model.estimatedHours,
        dueDate: model.dueDate,
        tags: model.tags,
      },
      model.id
    );
  }

  protected toModel(domain: Feature): Partial<FeatureModel> {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      priority: domain.priority,
      productId: domain.productId,
      productName: domain.productName,
      platform: domain.platform,
      requestedBy: domain.requestedBy,
      requestedByName: domain.requestedByName,
      assigneeId: domain.assigneeId,
      assigneeName: domain.assigneeName,
      sprintId: domain.sprintId,
      sprintName: domain.sprintName,
      votes: domain.votes,
      votedBy: domain.votedBy,
      estimatedHours: domain.estimatedHours,
      actualHours: domain.actualHours,
      dueDate: domain.dueDate,
      completedAt: domain.completedAt,
      tags: domain.tags,
      workspaceId: domain.workspaceId,
    };
  }

  async findAll(
    filters: FeatureFilters,
    sortOptions: FeatureSortOptions,
    page: number,
    limit: number
  ): Promise<{ features: Feature[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      const statuses = filters.status.split(",").map((s) => s.trim());
      where.status = { [Op.in]: statuses };
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
      features: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }
}
