// src/modules/releases/infrastructure/persistence/repositories/ReleaseRepository.ts
import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import {
  IReleaseRepository,
  ReleaseFilters,
  ReleaseSortOptions,
} from "@modules/releases/domain/repositories/IReleaseRepository";
import {
  Release,
  ReleaseStatus,
  PipelineStep,
  RollbackLog,
  LinkedFeature,
  LinkedBugFix,
  Approver,
  ApprovalStatus,
} from "@modules/releases/domain/entities/Release";
import { Platform } from "@modules/products/domain/entities/Product";
import { ReleaseModel } from "../models/ReleaseModel";
import { Op } from "sequelize";

export class ReleaseRepository
  extends BaseRepository<Release, ReleaseModel>
  implements IReleaseRepository
{
  constructor() {
    super(ReleaseModel);
  }

  protected toDomain(model: ReleaseModel): Release {
    const release = Release.create(
      {
        version: model.version,
        buildId: model.buildId,
        productId: model.productId,
        productName: model.productName,
        platform: model.platform as Platform,
        workspaceId: model.workspaceId,
        status: model.status as ReleaseStatus,
        plannedDate: model.plannedDate,
        releaseNotes: model.releaseNotes,
        testCoverage: Number(model.testCoverage),
      },
      model.id
    );

    // Restore complex properties
    (release as any).props.features = model.features as LinkedFeature[];
    (release as any).props.bugFixes = model.bugFixes as LinkedBugFix[];
    (release as any).props.pipeline = model.pipeline as PipelineStep[];
    (release as any).props.rollbackLogs = model.rollbackLogs as RollbackLog[];
    (release as any).props.approvers = model.approvers as Approver[];
    (release as any).props.approvalStatus = model.approvalStatus as
      | ApprovalStatus
      | undefined;
    (release as any).props.releaseDate = model.releaseDate;
    (release as any).props.createdAt = model.createdAt;
    (release as any).props.updatedAt = model.updatedAt;

    return release;
  }

  protected toModel(domain: Release): Partial<ReleaseModel> {
    return {
      id: domain.id,
      version: domain.version,
      buildId: domain.buildId,
      productId: domain.productId,
      productName: domain.productName,
      platform: domain.platform,
      status: domain.status,
      releaseDate: domain.releaseDate,
      plannedDate: domain.plannedDate,
      features: domain.features as any,
      bugFixes: domain.bugFixes as any,
      testCoverage: domain.testCoverage,
      pipeline: domain.pipeline as any,
      rollbackLogs: domain.rollbackLogs as any,
      releaseNotes: domain.releaseNotes,
      approvalStatus: domain.approvalStatus,
      approvers: domain.approvers as any,
      workspaceId: domain.workspaceId,
    };
  }

  async findAll(
    filters: ReleaseFilters,
    sortOptions: ReleaseSortOptions,
    page: number,
    limit: number
  ): Promise<{ releases: Release[]; total: number }> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.platform) {
      where.platform = filters.platform;
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
      releases: rows.map((model) => this.toDomain(model)),
      total: count,
    };
  }
}
