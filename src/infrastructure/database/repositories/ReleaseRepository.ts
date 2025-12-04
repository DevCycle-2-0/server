import { IReleaseRepository } from '@core/domain/repositories/IReleaseRepository';
import { Release, ReleaseStatus } from '@core/domain/entities/Release';
import { ReleaseModel } from '../models/ReleaseModel';

export class ReleaseRepository implements IReleaseRepository {
  async findById(id: string): Promise<Release | null> {
    const model: any = await ReleaseModel.findByPk(id);
    if (!model) return null;

    return Release.reconstitute(
      model.id,
      model.workspace_id,
      model.product_id,
      model.version,
      model.name,
      model.description || null,
      model.status as ReleaseStatus,
      model.release_notes || null,
      model.target_date || null,
      model.release_date || null,
      model.created_by,
      model.created_at,
      model.updated_at
    );
  }

  async findByProduct(productId: string): Promise<Release[]> {
    const models = await ReleaseModel.findAll({
      where: { product_id: productId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model: any) =>
      Release.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.version,
        model.name,
        model.description || null,
        model.status as ReleaseStatus,
        model.release_notes || null,
        model.target_date || null,
        model.release_date || null,
        model.created_by,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findByWorkspace(workspaceId: string): Promise<Release[]> {
    const models = await ReleaseModel.findAll({
      where: { workspace_id: workspaceId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model: any) =>
      Release.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.version,
        model.name,
        model.description || null,
        model.status as ReleaseStatus,
        model.release_notes || null,
        model.target_date || null,
        model.release_date || null,
        model.created_by,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(release: Release): Promise<void> {
    await ReleaseModel.create({
      id: release.id,
      workspace_id: release.workspaceId,
      product_id: release.productId,
      version: release.version,
      name: release.name,
      description: release.description,
      status: release.status,
      release_notes: release.releaseNotes,
      target_date: release.targetDate,
      release_date: release.releaseDate,
      created_by: release.createdBy,
    });
  }

  async update(release: Release): Promise<void> {
    await ReleaseModel.update(
      {
        name: release.name,
        description: release.description,
        status: release.status,
        release_notes: release.releaseNotes,
        target_date: release.targetDate,
        release_date: release.releaseDate,
        updated_at: release.updatedAt,
      },
      {
        where: { id: release.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await ReleaseModel.destroy({ where: { id } });
  }
}
