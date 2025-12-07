import { IReleaseRepository } from "@domain/repositories/IReleaseRepository";
import { Release } from "@domain/entities/Release";
import { ReleaseModel } from "../models/ReleaseModel";

export class ReleaseRepository implements IReleaseRepository {
  async create(release: Release): Promise<Release> {
    const created = await ReleaseModel.create({
      id: release.id,
      workspaceId: release.workspaceId,
      version: release.version,
      name: release.name,
      description: release.description,
      releaseNotes: release.releaseNotes,
      status: release.status,
      releaseType: release.releaseType,
      targetDate: release.targetDate,
      releasedAt: release.releasedAt,
      releasedBy: release.releasedBy,
      rollbackReason: release.rollbackReason,
      rolledBackAt: release.rolledBackAt,
      productId: release.productId,
      pipelineConfig: release.pipelineConfig,
      createdBy: release.createdBy,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Release | null> {
    const release = await ReleaseModel.findByPk(id, {
      include: ["product", "creator", "releaser"],
    });
    return release ? this.toDomain(release) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ releases: Release[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = { workspaceId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.releaseType = filters.type;

    const { rows, count } = await ReleaseModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: ["product"],
    });

    return {
      releases: rows.map((r) => this.toDomain(r)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Release>): Promise<Release> {
    await ReleaseModel.update(data, { where: { id } });
    const updated = await ReleaseModel.findByPk(id);
    if (!updated) throw new Error("Release not found");
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await ReleaseModel.destroy({ where: { id } });
  }

  private toDomain(model: ReleaseModel): Release {
    return new Release(
      model.id,
      model.workspaceId,
      model.version,
      model.name,
      model.description,
      model.releaseNotes,
      model.status,
      model.releaseType,
      model.targetDate,
      model.releasedAt,
      model.releasedBy,
      model.rollbackReason,
      model.rolledBackAt,
      model.productId,
      model.pipelineConfig,
      model.createdBy,
      model.createdAt,
      model.updatedAt
    );
  }
}
